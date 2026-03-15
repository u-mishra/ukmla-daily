import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password, questionIds, action = 'approve' } = await request.json();
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'No question IDs provided.' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'pending';

    // If rejecting, we just delete the questions
    if (action === 'reject') {
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', questionIds);
      if (error) throw error;
      return NextResponse.json({ message: `Rejected ${questionIds.length} questions.` });
    }

    const { error } = await supabase
      .from('questions')
      .update({ status: newStatus })
      .in('id', questionIds);

    if (error) throw error;

    return NextResponse.json({ message: `${action === 'approve' ? 'Approved' : 'Updated'} ${questionIds.length} questions.` });
  } catch (error) {
    console.error('Admin approve error:', error);
    return NextResponse.json({ error: 'Failed to update questions.' }, { status: 500 });
  }
}
