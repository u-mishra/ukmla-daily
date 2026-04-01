import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VALID_SPECIALTIES = ['ENT', 'Haematology', 'Neurology', 'Renal', 'Infectious Diseases'];

// GET — fetch preferences by token
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('preferences, email')
    .eq('preferences_token', token)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  // Mask email for display (e.g. m***@gmail.com)
  const email = data.email;
  const [local, domain] = email.split('@');
  const maskedEmail = local[0] + '***@' + domain;

  return NextResponse.json({
    email: maskedEmail,
    specialties: data.preferences?.specialties || VALID_SPECIALTIES,
    availableSpecialties: VALID_SPECIALTIES,
  });
}

// POST — update preferences
export async function POST(request: NextRequest) {
  try {
    const { token, specialties } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    if (!Array.isArray(specialties) || specialties.length === 0) {
      return NextResponse.json({ error: 'Select at least one specialty' }, { status: 400 });
    }

    // Validate specialties
    const valid = specialties.filter((s: string) => VALID_SPECIALTIES.includes(s));
    if (valid.length === 0) {
      return NextResponse.json({ error: 'No valid specialties selected' }, { status: 400 });
    }

    const { error, data } = await supabase
      .from('subscribers')
      .update({ preferences: { specialties: valid } })
      .eq('preferences_token', token)
      .eq('is_active', true)
      .select('id');

    if (error) {
      console.error('Preferences update error:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Preferences saved successfully', specialties: valid });
  } catch (error) {
    console.error('Preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
