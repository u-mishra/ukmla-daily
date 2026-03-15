'use client';

import { useState, useCallback } from 'react';
import DarkModeToggle from '@/components/DarkModeToggle';
import SubscribeForm from '@/components/SubscribeForm';
import { getReferenceValuesForSpecialty } from '@/lib/reference-values';

const DISCLAIMER =
  'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

interface Question {
  id: string;
  specialty: string;
  difficulty: string;
  vignette: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
  day_number: number | null;
}

export default function AnswerClient({
  question,
  initialPercentage,
  initialTotal,
}: {
  question: Question;
  initialPercentage: number;
  initialTotal: number;
}) {
  const [voted, setVoted] = useState(false);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [total, setTotal] = useState(initialTotal);
  const [highlightedSentences, setHighlightedSentences] = useState<Set<number>>(new Set());
  const [refOpen, setRefOpen] = useState(false);

  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
    { letter: 'E', text: question.option_e },
  ];

  const handleVote = useCallback(async (gotItRight: boolean) => {
    if (voted) return;
    setVoted(true);

    try {
      const res = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id, got_it_right: gotItRight }),
      });
      const data = await res.json();
      if (data.percentage !== undefined) {
        setPercentage(data.percentage);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
  }, [voted, question.id]);

  const toggleHighlight = (index: number) => {
    setHighlightedSentences(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const explanationSentences = question.explanation.split(/(?<=[.!?])\s+/).filter(Boolean);
  const refValues = getReferenceValuesForSpecialty(question.specialty);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <DarkModeToggle />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-12 sm:py-20">
        {/* Logo */}
        <a href="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-3 h-3 rounded-full gradient-bg animate-pulse-dot" />
          <span className="text-sm font-bold tracking-[0.25em] uppercase gradient-text">
            UKMLA Daily
          </span>
        </a>

        {question.day_number && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            Day {question.day_number}
          </p>
        )}

        {/* Question card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-lg mb-8 animate-fade-up">
          <div className="flex gap-2 mb-5">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold">
              {question.specialty}
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-semibold">
              {question.difficulty}
            </span>
          </div>

          <p className="font-serif text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
            {question.vignette}
          </p>

          <div className="space-y-3">
            {options.map((opt) => {
              const isCorrect = opt.letter === question.correct_answer;
              return (
                <div
                  key={opt.letter}
                  className={`p-3.5 rounded-xl border-2 flex items-start gap-3 transition-all ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : 'border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {isCorrect ? '✓' : opt.letter}
                  </span>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    {opt.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-800 p-6 sm:p-8 mb-8 animate-fade-up delay-100">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Explanation</h3>
          <div className="font-serif text-green-700 dark:text-green-300 text-sm sm:text-base leading-relaxed space-y-1">
            {explanationSentences.map((sentence, i) => (
              <span
                key={i}
                onClick={() => toggleHighlight(i)}
                className={`cursor-pointer transition-colors inline ${
                  highlightedSentences.has(i) ? 'bg-yellow-200 dark:bg-yellow-700/50 rounded px-0.5' : ''
                }`}
              >
                {sentence}{' '}
              </span>
            ))}
          </div>
          <p className="text-xs text-green-600/60 dark:text-green-400/40 mt-3">
            Tap any sentence to highlight it for revision
          </p>
        </div>

        {/* Reference Values */}
        {refValues && (
          <div className="mb-8 animate-fade-up delay-200">
            <button
              onClick={() => setRefOpen(!refOpen)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                📊 Reference Values — {question.specialty}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${refOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {refOpen && (
              <div className="mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {refValues.map((ref) => (
                    <div key={ref.name} className="flex justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">{ref.name}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-right ml-2">{ref.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Did you get it right? */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-8 text-center animate-fade-up delay-300">
          {!voted ? (
            <>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Did you get it right?</h3>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleVote(true)}
                  className="px-8 py-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors min-h-[44px]"
                >
                  Yes ✓
                </button>
                <button
                  onClick={() => handleVote(false)}
                  className="px-8 py-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors min-h-[44px]"
                >
                  No ✗
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {percentage}% of students got this right
              </p>
              <p className="text-sm text-gray-500">{total} responses</p>
            </>
          )}
        </div>

        {/* Signup CTA */}
        <div className="gradient-bg-subtle rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800/50 mb-8 animate-fade-up delay-400">
          <h3 className="text-center font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Get a question like this every morning — free
          </h3>
          <SubscribeForm />
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 pb-12 border-t border-gray-200 dark:border-gray-800">
          <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Privacy Policy
          </a>
          <p className="text-xs text-gray-400 dark:text-gray-600 max-w-lg mx-auto leading-relaxed mt-4">
            {DISCLAIMER}
          </p>
        </footer>
      </div>
    </main>
  );
}
