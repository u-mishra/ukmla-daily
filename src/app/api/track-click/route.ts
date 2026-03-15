import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { question_id, got_it_right, email } = await request.json();

    if (!question_id) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }

    // Log the click
    await supabase.from('answer_clicks').insert({
      question_id,
      subscriber_email: email || null,
      got_it_right: got_it_right ?? null,
    });

    // Calculate stats
    const { data: clicks } = await supabase
      .from('answer_clicks')
      .select('got_it_right')
      .eq('question_id', question_id)
      .not('got_it_right', 'is', null);

    const total = clicks?.length || 0;
    const correct = clicks?.filter(c => c.got_it_right).length || 0;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return NextResponse.json({ percentage, total });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json({ error: 'Failed to track click.' }, { status: 500 });
  }
}
