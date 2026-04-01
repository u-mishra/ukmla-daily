'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function PreferencesContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid link — no token provided.');
      setLoading(false);
      return;
    }

    fetch(`/api/preferences?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(data => {
        setEmail(data.email);
        setAvailable(data.availableSpecialties);
        setSelected(data.specialties);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not find your subscription. The link may be invalid or expired.');
        setLoading(false);
      });
  }, [token]);

  const toggleSpecialty = (specialty: string) => {
    setSelected(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
    setMessage(null);
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one specialty.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, specialties: selected }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Preferences saved! Your daily questions will now match your selected specialties.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save preferences.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">Loading your preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-5">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <a href="/" className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:opacity-80">
            ← Back to UKMLA Daily
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-5 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-6">
            <span className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400">UKMLA DAILY</span>
          </a>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Your Specialties
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Logged in as <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Choose which specialties you want to receive daily questions from.
          </p>
        </div>

        {/* Specialty checkboxes */}
        <div className="space-y-3 mb-8">
          {available.map(specialty => {
            const isSelected = selected.includes(specialty);
            return (
              <button
                key={specialty}
                onClick={() => toggleSpecialty(specialty)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-400'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 dark:bg-indigo-500'
                    : 'border-2 border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium text-sm ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {specialty}
                </span>
              </button>
            );
          })}
        </div>

        {/* Select all / none */}
        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => { setSelected([...available]); setMessage(null); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Select all
          </button>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <button
            onClick={() => { setSelected([]); setMessage(null); }}
            className="text-xs text-gray-500 dark:text-gray-400 font-medium hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || selected.length === 0}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <a href="/" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            ← Back to UKMLA Daily
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <PreferencesContent />
    </Suspense>
  );
}
