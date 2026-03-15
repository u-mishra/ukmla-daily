'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function unsubscribe() {
      if (!email) {
        setStatus('error');
        return;
      }

      const { error } = await supabase
        .from('subscribers')
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());

      if (error) {
        setStatus('error');
      } else {
        setStatus('success');
      }
    }

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-5">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <p className="text-gray-500">Unsubscribing...</p>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              You&apos;ve been unsubscribed
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Sorry to see you go! You won&apos;t receive any more daily questions.
            </p>
            <a href="/" className="text-sm gradient-text font-semibold hover:opacity-80">
              ← Back to UKMLA Daily
            </a>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We couldn&apos;t process your unsubscribe request. Please email contact@ukmladaily.co.uk for help.
            </p>
            <a href="/" className="text-sm gradient-text font-semibold hover:opacity-80">
              ← Back to UKMLA Daily
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
