'use client';

import { useState, FormEvent } from 'react';

export default function SubscribeForm({ id, variant = 'default' }: { id?: string; variant?: 'default' | 'compact' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-3 ${variant === 'compact' ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-[15px] min-h-[44px]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-60 whitespace-nowrap min-h-[44px] text-[15px]"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Subscribing...
            </span>
          ) : "Subscribe — it's free"}
        </button>
      </div>

      {status === 'success' && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{message}</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-500 font-medium">{message}</p>
      )}
    </form>
  );
}
