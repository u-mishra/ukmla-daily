import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('subscribers')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Unsubscribe error:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Unsubscribed successfully.' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
