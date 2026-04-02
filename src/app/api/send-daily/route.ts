import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { dailyQuestionEmailHtml } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_SPECIALTIES = ['ENT', 'Haematology', 'Neurology', 'Renal', 'Infectious Diseases'];

interface Question {
  id: string;
  specialty: string;
  difficulty: string;
  vignette: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
  status: string;
  sent_date: string | null;
  day_number: number | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  preferences: { specialties?: string[] } | null;
  preferences_token: string;
}

/**
 * Pick the best question for a specific subscriber, considering:
 * 1. Their specialty preferences
 * 2. Questions they've already received (never repeat)
 * 3. Smart scheduling (variety in specialty, question type)
 */
async function pickQuestionForSubscriber(
  subscriber: Subscriber,
  allApproved: Question[],
  globalRecentlySent: Array<{ specialty: string; vignette: string; sent_date: string }>
): Promise<Question | null> {
  const preferredSpecialties = subscriber.preferences?.specialties || DEFAULT_SPECIALTIES;

  // Get questions this subscriber has already received
  const { data: history } = await supabase
    .from('subscriber_question_history')
    .select('question_id')
    .eq('subscriber_id', subscriber.id);

  const receivedIds = new Set((history || []).map(h => h.question_id));

  // Filter: must match subscriber's specialties AND not already received
  const candidates = allApproved.filter(
    q => preferredSpecialties.includes(q.specialty) && !receivedIds.has(q.id)
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Smart scoring (same algorithm as before, but on filtered candidates)
  const sent = globalRecentlySent;
  const yesterdaySpecialty = sent.length > 0 ? sent[0].specialty : null;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSpecialties = new Set(
    sent
      .filter(q => q.sent_date && new Date(q.sent_date) >= sevenDaysAgo)
      .map(q => q.specialty)
  );

  const lastSentMap = new Map<string, string>();
  for (const q of sent) {
    if (!lastSentMap.has(q.specialty)) {
      lastSentMap.set(q.specialty, q.sent_date);
    }
  }

  const scored = candidates.map(q => {
    let score = 0;
    if (q.specialty === yesterdaySpecialty) score += 10000;
    if (recentSpecialties.has(q.specialty)) score += 1000;
    const lastSent = lastSentMap.get(q.specialty);
    if (lastSent) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 100 - daysSince);
    }
    return { question: q, score };
  });

  scored.sort((a, b) => a.score - b.score);

  const bestScore = scored[0].score;
  if (bestScore >= 10000) return scored[0].question;

  const viable = scored.filter(s => s.score < 10000);
  const bestViable = viable[0];

  // Vignette diversity within same specialty
  const recentSameSpecialty = sent.find(q => q.specialty === bestViable.question.specialty);
  if (recentSameSpecialty && viable.length > 1) {
    const sameSpecialtyCandidates = viable.filter(
      s => s.question.specialty === bestViable.question.specialty && s.score === bestViable.score
    );
    if (sameSpecialtyCandidates.length > 1) {
      const recentVignette = recentSameSpecialty.vignette.toLowerCase();
      const stemKeywords = ['diagnosis', 'investigation', 'management', 'treatment', 'mechanism', 'complication', 'next step'];
      const recentType = stemKeywords.find(k => recentVignette.includes(k)) || '';
      const different = sameSpecialtyCandidates.find(s => {
        const v = s.question.vignette.toLowerCase();
        const type = stemKeywords.find(k => v.includes(k)) || '';
        return type !== recentType;
      });
      if (different) return different.question;
    }
  }

  return bestViable.question;
}

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

    // Get all eligible questions: both approved (unsent) and previously sent
    // Previously-sent questions can still be sent to NEW subscribers who haven't received them
    const { data: allEligible } = await supabase
      .from('questions')
      .select('*')
      .in('status', ['approved', 'sent'])
      .order('created_at', { ascending: true });

    if (!allEligible || allEligible.length === 0) {
      return NextResponse.json({ error: 'No eligible questions available to send.' }, { status: 404 });
    }

    // Get recently sent questions for smart scheduling
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentlySent } = await supabase
      .from('questions')
      .select('specialty, vignette, sent_date')
      .eq('status', 'sent')
      .gte('sent_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('sent_date', { ascending: false });

    const globalRecentlySent = recentlySent || [];

    // Calculate day number
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    const dayNumber = (count || 0) + 1;

    // Get all active subscribers with preferences
    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('id, email, preferences, preferences_token')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers.' });
    }

    // Track which questions we've assigned so we can mark them sent
    const questionsUsed = new Map<string, Question>(); // question.id -> question
    let sentCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const sub of subscribers as Subscriber[]) {
      try {
        const question = await pickQuestionForSubscriber(sub, allEligible, globalRecentlySent);

        if (!question) {
          // Subscriber has received all available questions in their specialties
          skippedCount++;
          continue;
        }

        questionsUsed.set(question.id, question);

        const questionWithDay = { ...question, day_number: dayNumber };

        const { data, error } = await resend.emails.send({
          from: 'UKMLA Daily <question@ukmladaily.co.uk>',
          to: sub.email,
          subject: `🩺 ${question.specialty} | UKMLA Daily`,
          html: dailyQuestionEmailHtml(questionWithDay, sub.email, sub.preferences_token),
        });

        if (error) {
          const msg = `Resend error for ${sub.email}: ${JSON.stringify(error)}`;
          console.error(msg);
          errors.push(msg);
        } else {
          console.log(`Sent to ${sub.email} (q: ${question.id}), id: ${data?.id}`);
          sentCount++;

          // Log to subscriber_question_history
          await supabase.from('subscriber_question_history').insert({
            subscriber_id: sub.id,
            question_id: question.id,
          });
        }
      } catch (err) {
        const msg = `Exception for ${sub.email}: ${err instanceof Error ? err.message : JSON.stringify(err)}`;
        console.error(msg);
        errors.push(msg);
      }

      // 250ms delay between sends to stay under Resend's 5 req/s limit
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Mark newly-used questions as sent (only if still 'approved'; leave already-'sent' ones alone)
    for (const [qId, q] of questionsUsed) {
      if (q.status === 'approved') {
        await supabase
          .from('questions')
          .update({
            status: 'sent',
            sent_date: new Date().toISOString().split('T')[0],
            day_number: dayNumber,
          })
          .eq('id', qId);
      }
    }

    const response: Record<string, unknown> = {
      message: `Day ${dayNumber} sent to ${sentCount}/${subscribers.length} subscribers. ${questionsUsed.size} unique question(s) used.${skippedCount > 0 ? ` ${skippedCount} subscriber(s) skipped (no new questions).` : ''}`,
      questionCount: questionsUsed.size,
      dayNumber,
    };

    if (errors.length > 0) {
      response.errors = errors;
      console.error(`Send daily completed with ${errors.length} error(s):`, errors);
    }

    return NextResponse.json(response);
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
