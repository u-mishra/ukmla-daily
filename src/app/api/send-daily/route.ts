import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { dailyQuestionEmailHtml } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret or admin password
    const authHeader = request.headers.get('authorization');
    const body = await request.json().catch(() => ({}));
    const secret = authHeader?.replace('Bearer ', '') || body.secret;

    const isAuthorized =
      secret === process.env.CRON_SECRET ||
      (body.password && body.password === process.env.ADMIN_PASSWORD);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get next approved unsent question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('status', 'approved')
      .is('sent_date', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: 'No approved questions available to send.' }, { status: 404 });
    }

    // Calculate day number
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    const dayNumber = (count || 0) + 1;

    // Update question with day number and sent status
    await supabase
      .from('questions')
      .update({
        status: 'sent',
        sent_date: new Date().toISOString().split('T')[0],
        day_number: dayNumber,
      })
      .eq('id', question.id);

    const questionWithDay = { ...question, day_number: dayNumber };

    // Get all active subscribers
    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('email')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'Question marked as sent but no active subscribers.' });
    }

    // Send emails in batches (Resend supports batch sending)
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const emailPromises = batch.map(sub =>
        resend.emails.send({
          from: 'UKMLA Daily <question@ukmladaily.co.uk>',
          to: sub.email,
          subject: `🩺 Day ${dayNumber} — ${question.specialty} | UKMLA Daily`,
          html: dailyQuestionEmailHtml(questionWithDay, sub.email),
        }).catch(err => {
          console.error(`Failed to send to ${sub.email}:`, err);
          return null;
        })
      );
      const results = await Promise.all(emailPromises);
      sentCount += results.filter(Boolean).length;
    }

    return NextResponse.json({
      message: `Day ${dayNumber} sent to ${sentCount}/${subscribers.length} subscribers.`,
      questionId: question.id,
      dayNumber,
    });
  } catch (error) {
    console.error('Send daily error:', error);
    return NextResponse.json({ error: 'Failed to send daily email.' }, { status: 500 });
  }
}

// Also handle GET for Vercel cron (which sends GET requests)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.replace('Bearer ', '') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Forward to POST handler logic
  const fakeReq = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ secret: process.env.CRON_SECRET }),
  });
  return POST(fakeReq);
}
