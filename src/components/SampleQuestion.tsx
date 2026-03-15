'use client';

import { useState } from 'react';

const sampleQuestion = {
  specialty: 'ENT',
  difficulty: 'hard',
  vignette:
    'A 45-year-old woman presents with a 3-month history of progressive unilateral hearing loss and tinnitus in her right ear. On examination, the tympanic membrane appears normal. Weber test lateralises to the left ear, and Rinne test is negative on the right. An audiogram confirms right-sided sensorineural hearing loss. What is the most appropriate next investigation?',
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
        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-500/30'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
    }
    if (letter === sampleQuestion.correct) {
      return 'border-green-500 bg-green-50 dark:bg-green-950/30';
    }
    if (selected === letter && letter !== sampleQuestion.correct) {
      return 'border-red-500 bg-red-50 dark:bg-red-950/30';
    }
    return 'border-gray-200 dark:border-gray-700 opacity-60';
  };

  const getLetterBadgeStyle = (letter: string) => {
    if (!revealed) {
      return selected === letter
        ? 'bg-purple-500 text-white'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
    if (letter === sampleQuestion.correct) return 'bg-green-500 text-white';
    if (selected === letter && letter !== sampleQuestion.correct) return 'bg-red-500 text-white';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex gap-2 mb-5">
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold">
          {sampleQuestion.specialty}
        </span>
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-semibold">
          {sampleQuestion.difficulty}
        </span>
      </div>

      <p className="font-serif text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200 mb-6">
        {sampleQuestion.vignette}
      </p>

      <div className="space-y-3">
        {sampleQuestion.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => handleSelect(opt.letter)}
            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 min-h-[44px] ${getOptionStyle(opt.letter)}`}
          >
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${getLetterBadgeStyle(opt.letter)}`}
            >
              {revealed && opt.letter === sampleQuestion.correct ? '✓' : revealed && selected === opt.letter ? '✗' : opt.letter}
            </span>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{opt.text}</span>
          </button>
        ))}
      </div>

      {!revealed && (
        <button
          onClick={handleReveal}
          disabled={!selected}
          className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-base transition-all min-h-[44px] ${
            selected
              ? 'gradient-bg text-white hover:opacity-90 shadow-lg shadow-purple-500/25'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          Reveal Answer
        </button>
      )}

      {revealed && (
        <div className="mt-6 p-5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 animate-fade-up">
          <p className="font-semibold text-green-800 dark:text-green-300 mb-2 text-sm">Explanation</p>
          <p className="text-green-700 dark:text-green-300 text-sm sm:text-base leading-relaxed font-serif">
            {sampleQuestion.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
