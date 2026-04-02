'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
        } catch { /* silently fail */ }
      }
      setLoading(false);
    }
    checkPrevious();
  }, [email, question.id]);

  const handleSelect = useCallback((letter: string) => {
    if (submitted || eliminated.has(letter)) return;
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
    } catch { /* silently fail */ }
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
      <main className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <p className="text-[#86868B]">Loading question...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-16">
        {/* Header */}
        <a href="/" className="flex items-center justify-center gap-1 mb-8">
          <span className="text-[13px] font-bold tracking-tight text-[#1D1D1F]">UKMLA</span>
          <span className="text-[13px] font-bold tracking-tight text-[#1A6B52]">Daily</span>
        </a>

        {question.day_number && (
          <p className="text-center text-[13px] text-[#86868B] mb-2">Day {question.day_number}</p>
        )}

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] p-6 sm:p-8 shadow-sm mb-6">
          {/* Badges */}
          <div className="flex gap-2 mb-5">
            <span className="px-3 py-1 bg-[#E8F4F0] text-[#0F6E56] rounded-lg text-[11px] font-semibold">
              {question.specialty}
            </span>
            <span className="px-3 py-1 bg-[#FEF3E8] text-[#9A5B1D] rounded-lg text-[11px] font-semibold">
              {question.difficulty}
            </span>
          </div>

          {/* Vignette */}
          <p className="font-crimson text-[16px] sm:text-[17px] leading-[1.75] text-[#1D1D1F] mb-6">
            {question.vignette}
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminated.has(opt.letter);
              const isSelected = selected === opt.letter;
              const isCorrectAnswer = opt.letter === question.correct_answer;
              const wasUserPick = submitted && opt.letter === (previousAnswer || selected);

              let border = 'border-[#E8E8ED]';
              let bg = 'bg-white';
              let text = 'text-[#1D1D1F]';
              let letterCls = 'bg-[#F5F5F7] text-[#6E6E73]';
              let extra = '';
              let strike = '';

              if (submitted) {
                if (isCorrectAnswer) {
                  border = 'border-[#0F6E56]';
                  bg = 'bg-[#E8F4F0]';
                  letterCls = 'bg-[#0F6E56] text-white';
                  text = 'text-[#0F6E56]';
                } else if (wasUserPick && !isCorrect) {
                  border = 'border-[#C0392B]';
                  bg = 'bg-[#FDF2F0]';
                  letterCls = 'bg-[#C0392B] text-white';
                  text = 'text-[#C0392B]';
                } else {
                  extra = 'opacity-[0.35]';
                  if (i > 0) extra += ` -translate-x-2`;
                }
              } else {
                if (isEliminated) {
                  border = 'border-[#E8C4C0]';
                  bg = 'bg-[#FDF2F0]/50';
                  extra = 'opacity-40';
                  strike = 'line-through';
                  letterCls = 'bg-[#FDF2F0] text-[#C0392B]/60';
                } else if (isSelected) {
                  border = 'border-[#1A6B52]';
                  bg = 'bg-[#F0F7F4]';
                  letterCls = 'bg-[#1A6B52] text-white';
                }
              }

              return (
                <div
                  key={opt.letter}
                  onClick={() => handleSelect(opt.letter)}
                  className={`relative p-3.5 rounded-xl border-2 flex items-start gap-3 transition-all duration-300 ${border} ${bg} ${extra} ${
                    !submitted && !isEliminated ? 'cursor-pointer active:scale-[0.99]' : ''
                  }`}
                  style={submitted && !isCorrectAnswer && !wasUserPick ? { transitionDelay: `${i * 40}ms` } : undefined}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold transition-all duration-300 ${letterCls}`}>
                    {submitted && isCorrectAnswer ? '✓' : submitted && wasUserPick && !isCorrect ? '✗' : opt.letter}
                  </span>
                  <span className={`flex-1 text-[14px] sm:text-[15px] pt-0.5 transition-all duration-300 ${text} ${strike}`}>
                    {opt.text}
                  </span>

                  {/* Eliminate button */}
                  {!submitted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleEliminate(opt.letter); }}
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${
                        isEliminated
                          ? 'bg-[#F5D5D0] text-[#C0392B]'
                          : 'bg-[#F5F5F7] text-[#86868B] hover:bg-[#FDF2F0] hover:text-[#C0392B]'
                      }`}
                    >
                      ✕
                    </button>
                  )}

                  {/* Distribution % */}
                  {submitted && total > 0 && distribution[opt.letter] !== undefined && (
                    <span className="flex-shrink-0 text-[11px] text-[#86868B] font-medium w-10 text-right">
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
              className={`w-full mt-6 py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-200 min-h-[44px] ${
                selected
                  ? 'bg-[#1A6B52] text-white active:scale-[0.99]'
                  : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          )}

          {/* Result banner */}
          {submitted && (
            <div className={`mt-6 p-4 rounded-xl text-center ${
              isCorrect ? 'bg-[#E8F4F0] border border-[#C8E6D8]' : 'bg-[#FDF2F0] border border-[#F5D5D0]'
            }`}>
              <p className={`text-[17px] font-bold ${isCorrect ? 'text-[#0F6E56]' : 'text-[#C0392B]'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              {!isCorrect && (
                <p className="text-[13px] text-[#C0392B] mt-1">
                  You picked <strong>{previousAnswer || selected}</strong> — the correct answer is <strong>{question.correct_answer}</strong>
                </p>
              )}
              {total > 0 && (
                <p className="text-[13px] text-[#86868B] mt-2">
                  {percentage}% of {total} student{total !== 1 ? 's' : ''} got this right
                </p>
              )}
            </div>
          )}
        </div>

        {/* Explanation */}
        {submitted && (
          <div className="bg-[#F0F7F4] rounded-2xl p-6 sm:p-8 mb-6 animate-fade-up" style={{ borderLeft: '3px solid #1A6B52' }}>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#1A6B52] mb-3">Explanation</p>
            <div className="font-crimson text-[#3D3D3D] text-[15px] sm:text-[16px] leading-relaxed space-y-1">
              {explanationSentences.map((sentence, i) => (
                <span
                  key={i}
                  onClick={() => toggleHighlight(i)}
                  className={`cursor-pointer transition-colors inline ${
                    highlightedSentences.has(i) ? 'bg-[#D4EDDA] rounded px-0.5' : ''
                  }`}
                >
                  {sentence}{' '}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#86868B] mt-3">Tap any sentence to highlight it</p>
          </div>
        )}

        {/* Reference Values */}
        {submitted && refValues && (
          <div className="mb-6">
            <button
              onClick={() => setRefOpen(!refOpen)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E8ED] hover:bg-[#F5F5F7] transition-colors"
            >
              <span className="text-[13px] font-semibold text-[#6E6E73]">
                Reference Values — {question.specialty}
              </span>
              <svg className={`w-4 h-4 text-[#86868B] transition-transform ${refOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {refOpen && (
              <div className="mt-2 p-4 rounded-2xl bg-white border border-[#E8E8ED]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {refValues.map((ref) => (
                    <div key={ref.name} className="flex justify-between text-[13px] py-1.5 px-2 rounded-lg hover:bg-[#F5F5F7]">
                      <span className="text-[#6E6E73]">{ref.name}</span>
                      <span className="font-medium text-[#1D1D1F] text-right ml-2">{ref.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signup CTA */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8ED] mb-6">
          <h3 className="text-center font-serif-display text-[#1D1D1F] text-[18px] mb-4">
            Get a question like this every morning — free
          </h3>
          <SubscribeForm />
        </div>

        {/* Footer */}
        <footer className="text-center pt-6 pb-10 border-t border-[#E8E8ED]">
          <a href="/privacy" className="text-[12px] text-[#1A6B52] hover:underline transition-colors">
            Privacy Policy
          </a>
          <p className="text-[11px] text-[#86868B] max-w-lg mx-auto leading-relaxed mt-4">
            {DISCLAIMER}
          </p>
        </footer>
      </div>
    </main>
  );
}
