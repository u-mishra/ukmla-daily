import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password, status = 'pending' } = await request.json();
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ questions: data || [] });
  } catch (error) {
    console.error('Admin questions error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions.' }, { status: 500 });
  }
}
