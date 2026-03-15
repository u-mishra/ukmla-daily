import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      { count: totalSubscribers },
      { count: activeSubscribers },
      { count: approvedQueue },
      { count: pendingReview },
      { count: totalSent },
      { data: todayClicks },
    ] = await Promise.all([
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'approved').is('sent_date', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      supabase.from('answer_clicks').select('*').gte('clicked_at', new Date().toISOString().split('T')[0]),
    ]);

    return NextResponse.json({
      totalSubscribers: totalSubscribers || 0,
      activeSubscribers: activeSubscribers || 0,
      approvedQueue: approvedQueue || 0,
      pendingReview: pendingReview || 0,
      totalSent: totalSent || 0,
      todayClicks: todayClicks?.length || 0,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats.' }, { status: 500 });
  }
}
