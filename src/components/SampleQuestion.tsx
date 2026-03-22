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
    { letter: 'C', text: 'MRI of the internal auditory meati' },
    { letter: 'D', text: 'Otoacoustic emissions testing' },
    { letter: 'E', text: 'Brainstem evoked response audiometry' },
  ],
  correct: 'C',
  explanation:
    'Unilateral sensorineural hearing loss with tinnitus should raise suspicion of a vestibular schwannoma (acoustic neuroma). MRI with gadolinium of the internal auditory meati is the gold-standard investigation to identify cerebellopontine angle tumours. Audiometry has already confirmed the hearing loss pattern; imaging is needed to identify the underlying cause.',
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
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
        : 'border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600';
    }
    if (letter === sampleQuestion.correct) {
      return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
    }
    if (selected === letter && letter !== sampleQuestion.correct) {
      return 'border-red-400 bg-red-50 dark:bg-red-950/30';
    }
    return 'border-gray-200 dark:border-gray-700/60 opacity-50';
  };

  const getLetterBadgeStyle = (letter: string) => {
    if (!revealed) {
      return selected === letter
        ? 'bg-indigo-500 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    }
    if (letter === sampleQuestion.correct) return 'bg-emerald-500 text-white';
    if (selected === letter && letter !== sampleQuestion.correct) return 'bg-red-400 text-white';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-2 mb-5">
        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-semibold">
          {sampleQuestion.specialty}
        </span>
        <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-md text-xs font-semibold">
          {sampleQuestion.difficulty}
        </span>
      </div>

      <p className="text-base sm:text-[17px] leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        {sampleQuestion.vignette}
      </p>

      <div className="space-y-2.5">
        {sampleQuestion.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => handleSelect(opt.letter)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 min-h-[44px] cursor-pointer ${getOptionStyle(opt.letter)}`}
          >
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors duration-200 ${getLetterBadgeStyle(opt.letter)}`}
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
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          Reveal Answer
        </button>
      )}

      {revealed && (
        <div className="mt-6 p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 animate-fade-up">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2 text-sm">Explanation</p>
          <p className="text-emerald-700 dark:text-emerald-300/90 text-sm sm:text-[15px] leading-relaxed">
            {sampleQuestion.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
