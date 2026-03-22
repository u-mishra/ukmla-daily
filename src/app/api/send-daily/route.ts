import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { dailyQuestionEmailHtml } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

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

/**
 * Smart question picker:
 * 1. Never same specialty as yesterday
 * 2. Never same specialty within the past 7 days if alternatives exist
 * 3. Prefer least-recently-sent specialties (maximise variety)
 * 4. Among candidates for a specialty, prefer questions that test a different
 *    aspect than the most recent question from that same specialty
 */
async function pickNextQuestion(): Promise<Question | null> {
  // Get all approved unsent questions
  const { data: candidates } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'approved')
    .is('sent_date', null)
    .order('created_at', { ascending: true });

  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Get recently sent questions (last 30 days for LRU tracking)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentlySent } = await supabase
    .from('questions')
    .select('specialty, vignette, sent_date')
    .eq('status', 'sent')
    .gte('sent_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('sent_date', { ascending: false });

  const sent = recentlySent || [];

  // Yesterday's specialty (must avoid)
  const yesterdaySpecialty = sent.length > 0 ? sent[0].specialty : null;

  // Specialties sent in the last 7 days (prefer to avoid)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSpecialties = new Set(
    sent
      .filter(q => q.sent_date && new Date(q.sent_date) >= sevenDaysAgo)
      .map(q => q.specialty)
  );

  // Build a map: specialty → last sent date (for LRU ordering)
  const lastSentMap = new Map<string, string>();
  for (const q of sent) {
    if (!lastSentMap.has(q.specialty)) {
      lastSentMap.set(q.specialty, q.sent_date);
    }
  }

  // Score each candidate: lower score = better pick
  const scored = candidates.map(q => {
    let score = 0;

    // Hard block: same specialty as yesterday → very high score
    if (q.specialty === yesterdaySpecialty) {
      score += 10000;
    }

    // Penalise specialties sent in the last 7 days
    if (recentSpecialties.has(q.specialty)) {
      score += 1000;
    }

    // LRU: prefer specialties that haven't been sent recently
    // Never-sent specialties get score 0 (best), recently-sent get higher scores
    const lastSent = lastSentMap.get(q.specialty);
    if (lastSent) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60 * 24)
      );
      // More recently sent = higher penalty (inverse of days since)
      score += Math.max(0, 100 - daysSince);
    }
    // Never-sent specialties get no LRU penalty (score += 0)

    return { question: q, score };
  });

  // Sort by score (ascending = best first)
  scored.sort((a, b) => a.score - b.score);

  // Get the best score tier (all candidates with the same best score)
  const bestScore = scored[0].score;

  // If best score is 10000+, it means ALL candidates are yesterday's specialty
  // In that case, just pick the first one (no alternative exists)
  if (bestScore >= 10000) {
    return scored[0].question;
  }

  // Filter to candidates that don't have the hard-block penalty
  const viable = scored.filter(s => s.score < 10000);

  // Among viable candidates with similar scores, check for vignette diversity
  // within the same specialty (avoid testing same aspect back-to-back)
  const bestViable = viable[0];

  // Find if there's a recently sent question from the same specialty
  const recentSameSpecialty = sent.find(q => q.specialty === bestViable.question.specialty);

  if (recentSameSpecialty && viable.length > 1) {
    // Check if there are other candidates from the same specialty
    // that test a different aspect (simple heuristic: different question stem keyword)
    const sameSpecialtyCandidates = viable.filter(
      s => s.question.specialty === bestViable.question.specialty && s.score === bestViable.score
    );

    if (sameSpecialtyCandidates.length > 1) {
      // Pick the one whose vignette is most different from the recently sent one
      const recentVignette = recentSameSpecialty.vignette.toLowerCase();
      const stemKeywords = ['diagnosis', 'investigation', 'management', 'treatment', 'mechanism', 'complication', 'next step'];

      const recentType = stemKeywords.find(k => recentVignette.includes(k)) || '';

      // Prefer a candidate that tests a different type
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

    // Smart question selection
    const question = await pickNextQuestion();

    if (!question) {
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
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const emailPromises = batch.map(async (sub) => {
        try {
          const { data, error } = await resend.emails.send({
            from: 'UKMLA Daily <question@ukmladaily.co.uk>',
            to: sub.email,
            subject: `🩺 Day ${dayNumber} — ${question.specialty} | UKMLA Daily`,
            html: dailyQuestionEmailHtml(questionWithDay, sub.email),
          });

          if (error) {
            const msg = `Resend error for ${sub.email}: ${JSON.stringify(error)}`;
            console.error(msg);
            errors.push(msg);
            return false;
          }

          console.log(`Sent to ${sub.email}, id: ${data?.id}`);
          return true;
        } catch (err) {
          const msg = `Exception sending to ${sub.email}: ${err instanceof Error ? err.message : JSON.stringify(err)}`;
          console.error(msg);
          errors.push(msg);
          return false;
        }
      });
      const results = await Promise.all(emailPromises);
      sentCount += results.filter(Boolean).length;
    }

    const response: Record<string, unknown> = {
      message: `Day ${dayNumber} (${question.specialty}) sent to ${sentCount}/${subscribers.length} subscribers.`,
      questionId: question.id,
      specialty: question.specialty,
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
