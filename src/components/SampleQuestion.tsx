'use client';

import { useState } from 'react';

const sampleQuestion = {
  specialty: 'ENT',
  difficulty: 'Hard',
  vignette:
    'A 45-year-old woman presents with a 3-month history of progressive unilateral hearing loss and tinnitus in her right ear. On examination, the tympanic membrane appears normal. Weber test lateralises to the left ear, and Rinne test is positive bilaterally. An audiogram confirms right-sided sensorineural hearing loss. What is the most appropriate next investigation?',
  options: [
    { letter: 'A', text: 'CT scan of the temporal bones' },
    { letter: 'B', text: 'Tympanometry' },
    { letter: 'C', text: 'MRI of the cerebellopontine angle' },
    { letter: 'D', text: 'Otoacoustic emissions testing' },
    { letter: 'E', text: 'Brainstem evoked response audiometry' },
  ],
  correct: 'C',
  explanation:
    'Unilateral sensorineural hearing loss with tinnitus should raise suspicion of a vestibular schwannoma (acoustic neuroma). MRI with gadolinium of the cerebellopontine angle is the gold-standard investigation to identify CPA tumours. Audiometry has already confirmed the hearing loss pattern; imaging is needed to identify the underlying cause.',
};

export default function SampleQuestion() {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (letter: string) => {
    if (!revealed) setSelected(letter);
  };

  const handleReveal = () => {
    if (selected) setRevealed(true);
  };

  const getOptionStyle = (letter: string) => {
    if (!revealed) {
      return selected === letter
        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm shadow-indigo-500/10'
        : 'border-gray-200/80 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30';
    }
    if (letter === sampleQuestion.correct) {
      return 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-sm shadow-emerald-500/10';
    }
    if (selected === letter && letter !== sampleQuestion.correct) {
      return 'border-red-400 bg-red-50/80 dark:bg-red-950/30';
    }
    return 'border-gray-200/60 dark:border-gray-700/40 opacity-40';
  };

  const getLetterBadgeStyle = (letter: string) => {
    if (!revealed) {
      return selected === letter
        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    }
    if (letter === sampleQuestion.correct) return 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30';
    if (selected === letter && letter !== sampleQuestion.correct) return 'bg-red-400 text-white';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
  };

  return (
    <div className="relative bg-white/80 dark:bg-gray-900/60 glass-card rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 sm:p-8 shadow-xl shadow-indigo-500/[0.07] dark:shadow-indigo-900/30 hover:shadow-2xl hover:shadow-indigo-500/[0.1] dark:hover:shadow-indigo-900/40 hover:-translate-y-0.5 transition-all duration-500 border-l-4 border-l-indigo-500/70 dark:border-l-indigo-400/50">
      <div className="flex gap-2 mb-5">
        <span className="px-2.5 py-0.5 bg-indigo-100/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-semibold">
          {sampleQuestion.specialty}
        </span>
        <span className="px-2.5 py-0.5 bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-md text-xs font-semibold">
          {sampleQuestion.difficulty}
        </span>
      </div>

      <p className="text-base sm:text-[17px] leading-[1.75] text-gray-700 dark:text-gray-300 mb-7">
        {sampleQuestion.vignette}
      </p>

      <div className="space-y-2.5">
        {sampleQuestion.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => handleSelect(opt.letter)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 min-h-[44px] cursor-pointer active:scale-[0.99] ${getOptionStyle(opt.letter)}`}
          >
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${getLetterBadgeStyle(opt.letter)}`}
            >
              {revealed && opt.letter === sampleQuestion.correct ? '✓' : revealed && selected === opt.letter ? '✗' : opt.letter}
            </span>
            <span className="text-sm sm:text-[15px] text-gray-700 dark:text-gray-300 pt-0.5">{opt.text}</span>
          </button>
        ))}
      </div>

      {!revealed && (
        <button
          onClick={handleReveal}
          disabled={!selected}
          className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-200 min-h-[44px] ${
            selected
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          Reveal Answer
        </button>
      )}

      {revealed && (
        <div className="mt-6 p-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 animate-fade-up">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2 text-sm">Explanation</p>
          <p className="text-emerald-700 dark:text-emerald-300/90 text-sm sm:text-[15px] leading-relaxed">
            {sampleQuestion.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
