import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all responses with question data
    const { data: responses } = await supabase
      .from('question_responses')
      .select('question_id, subscriber_email, selected_answer, is_correct, time_to_answer_seconds, answered_at');

    const { data: questions } = await supabase
      .from('questions')
      .select('id, specialty, vignette, correct_answer, difficulty')
      .eq('status', 'sent');

    const allResponses = responses || [];
    const allQuestions = questions || [];

    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    // Overall stats
    const totalResponses = allResponses.length;
    const totalCorrect = allResponses.filter(r => r.is_correct).length;
    const overallPercent = totalResponses > 0 ? Math.round((totalCorrect / totalResponses) * 100) : 0;
    const timesWithValues = allResponses.filter(r => r.time_to_answer_seconds != null);
    const avgTime = timesWithValues.length > 0
      ? Math.round(timesWithValues.reduce((s, r) => s + r.time_to_answer_seconds, 0) / timesWithValues.length)
      : 0;

    // Per-specialty breakdown
    const specialtyStats: Record<string, { total: number; correct: number }> = {};
    for (const r of allResponses) {
      const q = questionMap.get(r.question_id);
      if (!q) continue;
      if (!specialtyStats[q.specialty]) specialtyStats[q.specialty] = { total: 0, correct: 0 };
      specialtyStats[q.specialty].total++;
      if (r.is_correct) specialtyStats[q.specialty].correct++;
    }

    const specialtyBreakdown = Object.entries(specialtyStats).map(([specialty, s]) => ({
      specialty,
      total: s.total,
      correct: s.correct,
      percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));

    // Per-question breakdown
    const questionStats: Record<string, { total: number; correct: number; answers: Record<string, number> }> = {};
    for (const r of allResponses) {
      if (!questionStats[r.question_id]) {
        questionStats[r.question_id] = { total: 0, correct: 0, answers: { A: 0, B: 0, C: 0, D: 0, E: 0 } };
      }
      questionStats[r.question_id].total++;
      if (r.is_correct) questionStats[r.question_id].correct++;
      questionStats[r.question_id].answers[r.selected_answer] = (questionStats[r.question_id].answers[r.selected_answer] || 0) + 1;
    }

    const questionBreakdown = Object.entries(questionStats)
      .map(([qId, s]) => {
        const q = questionMap.get(qId);
        // Find most common wrong answer
        const wrongAnswers = Object.entries(s.answers)
          .filter(([letter]) => letter !== q?.correct_answer)
          .sort((a, b) => b[1] - a[1]);

        return {
          questionId: qId,
          specialty: q?.specialty || 'Unknown',
          difficulty: q?.difficulty || 'Unknown',
          vignette: q?.vignette?.substring(0, 120) + '...' || '',
          correctAnswer: q?.correct_answer || '',
          total: s.total,
          correct: s.correct,
          percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
          mostCommonWrong: wrongAnswers[0] ? { letter: wrongAnswers[0][0], count: wrongAnswers[0][1] } : null,
          distribution: s.answers,
        };
      })
      .sort((a, b) => a.percent - b.percent); // hardest first

    // Per-subscriber breakdown
    const subscriberStats: Record<string, { total: number; correct: number }> = {};
    for (const r of allResponses) {
      const email = r.subscriber_email || 'anonymous';
      if (!subscriberStats[email]) subscriberStats[email] = { total: 0, correct: 0 };
      subscriberStats[email].total++;
      if (r.is_correct) subscriberStats[email].correct++;
    }

    const subscriberBreakdown = Object.entries(subscriberStats)
      .map(([email, s]) => ({
        email,
        total: s.total,
        correct: s.correct,
        percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total); // most engaged first

    return NextResponse.json({
      overall: {
        totalResponses,
        overallPercent,
        avgTimeSeconds: avgTime,
      },
      specialtyBreakdown,
      questionBreakdown,
      subscriberBreakdown,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
