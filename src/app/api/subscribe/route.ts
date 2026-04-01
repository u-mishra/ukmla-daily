import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';
import { Resend } from 'resend';
import { welcomeEmailHtml } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_SPECIALTIES = ['ENT', 'Haematology', 'Neurology', 'Renal', 'Infectious Diseases'];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if subscriber exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    let preferencesToken: string;

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ message: "You're already subscribed! Check your inbox at 7am tomorrow." });
      }
      // Reactivate
      await supabase
        .from('subscribers')
        .update({ is_active: true, unsubscribed_at: null })
        .eq('email', normalizedEmail);

      preferencesToken = existing.preferences_token;
    } else {
      const token = crypto.randomUUID();
      const { error, data } = await supabase
        .from('subscribers')
        .insert({
          email: normalizedEmail,
          preferences: { specialties: DEFAULT_SPECIALTIES },
          preferences_token: token,
        })
        .select('preferences_token')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
      }

      preferencesToken = data?.preferences_token || token;
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: 'UKMLA Daily <question@ukmladaily.co.uk>',
        to: normalizedEmail,
        subject: 'Welcome to UKMLA Daily 🩺',
        html: welcomeEmailHtml(normalizedEmail, preferencesToken),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({ message: "You're in! Check your inbox for a welcome email." });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
