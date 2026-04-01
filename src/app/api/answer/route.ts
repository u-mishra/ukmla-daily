import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      question_id,
      email,
      selected_answer,
      is_correct,
      eliminated_options,
      time_to_answer_seconds,
    } = await request.json();

    if (!question_id || !selected_answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('question_responses').insert({
      question_id,
      subscriber_email: email || null,
      selected_answer,
      is_correct,
      eliminated_options: eliminated_options || [],
      time_to_answer_seconds: time_to_answer_seconds || null,
    });

    if (error) {
      // Unique constraint violation — already answered
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already answered' }, { status: 409 });
      }
      throw error;
    }

    // Return updated stats for this question
    const { data: responses } = await supabase
      .from('question_responses')
      .select('is_correct, selected_answer')
      .eq('question_id', question_id);

    const total = responses?.length || 0;
    const correct = responses?.filter(r => r.is_correct).length || 0;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Count answer distribution
    const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const r of responses || []) {
      distribution[r.selected_answer] = (distribution[r.selected_answer] || 0) + 1;
    }

    return NextResponse.json({ percentage, total, distribution });
  } catch (error) {
    console.error('Answer submit error:', error);
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}

// GET — check if user already answered
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const questionId = url.searchParams.get('question_id');
  const email = url.searchParams.get('email');

  if (!questionId || !email) {
    return NextResponse.json({ answered: false });
  }

  const { data } = await supabase
    .from('question_responses')
    .select('selected_answer, is_correct, eliminated_options, time_to_answer_seconds')
    .eq('question_id', questionId)
    .eq('subscriber_email', email)
    .single();

  if (data) {
    // Also get stats
    const { data: responses } = await supabase
      .from('question_responses')
      .select('is_correct, selected_answer')
      .eq('question_id', questionId);

    const total = responses?.length || 0;
    const correct = responses?.filter(r => r.is_correct).length || 0;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const r of responses || []) {
      distribution[r.selected_answer] = (distribution[r.selected_answer] || 0) + 1;
    }

    return NextResponse.json({
      answered: true,
      previous: data,
      percentage,
      total,
      distribution,
    });
  }

  return NextResponse.json({ answered: false });
}
