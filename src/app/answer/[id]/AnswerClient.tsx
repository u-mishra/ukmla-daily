'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export default function AnswerClient({
  question,
  email,
}: {
  question: Question;
  email: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [highlightedSentences, setHighlightedSentences] = useState<Set<number>>(new Set());
  const [refOpen, setRefOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousAnswer, setPreviousAnswer] = useState<string | null>(null);
  const pageLoadTime = useRef(Date.now());

  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
    { letter: 'E', text: question.option_e },
  ];

  // Check if user already answered
  useEffect(() => {
    async function checkPrevious() {
      if (email) {
        try {
          const res = await fetch(`/api/answer?question_id=${question.id}&email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (data.answered) {
            setSubmitted(true);
            setPreviousAnswer(data.previous.selected_answer);
            setSelected(data.previous.selected_answer);
            setIsCorrect(data.previous.is_correct);
            setPercentage(data.percentage);
            setTotal(data.total);
            setDistribution(data.distribution || {});
            if (data.previous.eliminated_options) {
              setEliminated(new Set(data.previous.eliminated_options));
            }
          }
        } catch {
          // Silently fail
        }
      }
      setLoading(false);
    }
    checkPrevious();
  }, [email, question.id]);

  const handleSelect = useCallback((letter: string) => {
    if (submitted) return;
    if (eliminated.has(letter)) return;
    setSelected(letter);
  }, [submitted, eliminated]);

  const toggleEliminate = useCallback((letter: string) => {
    if (submitted) return;
    setEliminated(prev => {
      const next = new Set(prev);
      if (next.has(letter)) {
        next.delete(letter);
      } else {
        next.add(letter);
        // If this was the selected answer, deselect it
        if (selected === letter) setSelected(null);
      }
      return next;
    });
  }, [submitted, selected]);

  const handleSubmit = async () => {
    if (!selected || submitted) return;
    const correct = selected === question.correct_answer;
    setIsCorrect(correct);
    setSubmitted(true);

    const timeSeconds = Math.round((Date.now() - pageLoadTime.current) / 1000);

    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          email: email || null,
          selected_answer: selected,
          is_correct: correct,
          eliminated_options: Array.from(eliminated),
          time_to_answer_seconds: timeSeconds,
        }),
      });
      const data = await res.json();
      if (data.percentage !== undefined) {
        setPercentage(data.percentage);
        setTotal(data.total);
        setDistribution(data.distribution || {});
      }
    } catch {
      // Silently fail
    }
  };

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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading question...</p>
      </main>
    );
  }

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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-lg mb-6 animate-fade-up">
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

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt) => {
              const isEliminated = eliminated.has(opt.letter);
              const isSelected = selected === opt.letter;
              const isCorrectAnswer = opt.letter === question.correct_answer;
              const wasUserPick = submitted && opt.letter === (previousAnswer || selected);

              let borderClass = 'border-gray-200 dark:border-gray-700';
              let bgClass = 'bg-white dark:bg-gray-900';
              let textClass = 'text-gray-700 dark:text-gray-300';
              let letterBgClass = 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
              let opacityClass = '';
              let strikeClass = '';

              if (submitted) {
                if (isCorrectAnswer) {
                  borderClass = 'border-green-500 dark:border-green-400';
                  bgClass = 'bg-green-50 dark:bg-green-950/30';
                  letterBgClass = 'bg-green-500 text-white';
                } else if (wasUserPick && !isCorrect) {
                  borderClass = 'border-red-400 dark:border-red-500';
                  bgClass = 'bg-red-50 dark:bg-red-950/20';
                  letterBgClass = 'bg-red-500 text-white';
                } else {
                  opacityClass = 'opacity-50';
                }
              } else {
                if (isEliminated) {
                  borderClass = 'border-red-200 dark:border-red-900/50';
                  bgClass = 'bg-red-50/50 dark:bg-red-950/10';
                  opacityClass = 'opacity-40';
                  strikeClass = 'line-through';
                  letterBgClass = 'bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500';
                } else if (isSelected) {
                  borderClass = 'border-indigo-500 dark:border-indigo-400';
                  bgClass = 'bg-indigo-50 dark:bg-indigo-950/30';
                  letterBgClass = 'bg-indigo-600 dark:bg-indigo-500 text-white';
                  textClass = 'text-indigo-900 dark:text-indigo-200';
                }
              }

              return (
                <div
                  key={opt.letter}
                  className={`relative p-3.5 rounded-xl border-2 flex items-start gap-3 transition-all ${borderClass} ${bgClass} ${opacityClass} ${
                    !submitted && !isEliminated ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 active:scale-[0.99]' : ''
                  } ${submitted ? '' : 'cursor-pointer'}`}
                  onClick={() => handleSelect(opt.letter)}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${letterBgClass}`}
                  >
                    {submitted && isCorrectAnswer ? '✓' : submitted && wasUserPick && !isCorrect ? '✗' : opt.letter}
                  </span>
                  <span className={`flex-1 text-sm sm:text-base ${textClass} ${strikeClass} transition-all`}>
                    {opt.text}
                  </span>

                  {/* Eliminate button — only pre-submit */}
                  {!submitted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleEliminate(opt.letter); }}
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isEliminated
                          ? 'bg-red-200 dark:bg-red-800 text-red-600 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500'
                      }`}
                      title={isEliminated ? 'Undo eliminate' : 'Eliminate option'}
                    >
                      ✕
                    </button>
                  )}

                  {/* Answer distribution bar — post-submit */}
                  {submitted && total > 0 && distribution[opt.letter] !== undefined && (
                    <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 font-medium w-10 text-right">
                      {Math.round((distribution[opt.letter] / total) * 100)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`w-full mt-6 py-3.5 rounded-xl font-semibold text-base transition-all ${
                selected
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-[0.99]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          )}

          {/* Result banner */}
          {submitted && (
            <div className={`mt-6 p-4 rounded-xl text-center ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-lg font-bold ${
                isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  You picked <strong>{previousAnswer || selected}</strong> — the correct answer is <strong>{question.correct_answer}</strong>
                </p>
              )}
              {total > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {percentage}% of {total} student{total !== 1 ? 's' : ''} got this right
                </p>
              )}
            </div>
          )}
        </div>

        {/* Explanation — only after submit */}
        {submitted && (
          <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-800 p-6 sm:p-8 mb-8 animate-fade-up">
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
        )}

        {/* Reference Values — only after submit */}
        {submitted && refValues && (
          <div className="mb-8 animate-fade-up">
            <button
              onClick={() => setRefOpen(!refOpen)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Reference Values — {question.specialty}
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

        {/* Signup CTA */}
        <div className="gradient-bg-subtle rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800/50 mb-8 animate-fade-up">
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
