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

    if (action === 'reject') {
      // Update status to 'rejected' instead of deleting.
      // This uses the existing UPDATE RLS policy (which works) rather than
      // DELETE (which requires a separate RLS policy that may not be applied).
      const { error, data } = await supabase
        .from('questions')
        .update({ status: 'rejected' })
        .in('id', questionIds)
        .select('id');

      if (error) {
        console.error('Reject error:', error);
        throw error;
      }

      const rejectedCount = data?.length || 0;
      console.log(`Rejected ${rejectedCount} question(s), ids: ${questionIds.join(', ')}`);
      return NextResponse.json({ message: `Rejected ${rejectedCount} question(s).`, count: rejectedCount });
    }

    // Approve
    const { error } = await supabase
      .from('questions')
      .update({ status: 'approved' })
      .in('id', questionIds);

    if (error) throw error;

    return NextResponse.json({ message: `Approved ${questionIds.length} question(s).` });
  } catch (error) {
    console.error('Admin approve error:', error);
    return NextResponse.json({ error: 'Failed to update questions.' }, { status: 500 });
  }
}
