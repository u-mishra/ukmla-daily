'use client';

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';

const DISCLAIMER =
  'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

const SPECIALTIES = ['ENT', 'Haematology', 'Neurology', 'Renal', 'Infectious Diseases'];

const G = '#1A6B52'; // primary teal-green

const SAMPLE_QUESTION = {
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
    'Unilateral sensorineural hearing loss with tinnitus should raise suspicion of a vestibular schwannoma (acoustic neuroma). MRI with gadolinium of the cerebellopontine angle is the gold-standard investigation to identify CPA tumours. CT temporal bones assess bony anatomy, not soft-tissue CPA lesions. Tympanometry tests middle ear compliance and is normal in sensorineural loss.',
};

/* ─── Hooks ─── */
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useStaggerReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll('[data-stagger]').forEach((child, i) => {
            (child as HTMLElement).style.transitionDelay = `${i * 90}ms`;
            child.classList.add('stagger-visible');
          });
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ═══════════════════════════════════════ */
/* ─── Page                            ─── */
/* ═══════════════════════════════════════ */
export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      {/* Nav */}
      <nav className={`nav-slide fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navScrolled ? 'bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/[0.06]' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-tight">
            <span className="text-[#1D1D1F]">UKMLA</span>{' '}
            <span style={{ color: G }}>Daily</span>
          </span>
          <a href="#subscribe" className="cta-link text-[13px] font-medium transition-colors" style={{ color: G }}>
            Subscribe free <span className="cta-chevron">›</span>
          </a>
        </div>
      </nav>

      <HeroSection />
      <DemoSection />
      <CustomiseSection />
      <SignupSection />
      <FooterSection />
    </main>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Hero                            ─── */
/* ═══════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="bg-[#F5F5F7] pt-20 sm:pt-24 pb-8 sm:pb-10">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <p className="stagger-in text-[14px] font-bold tracking-[3px] uppercase mb-4"
           style={{ color: G, animationDelay: '0.2s' }}>
          UKMLA DAILY
        </p>

        <h1 className="clip-reveal font-serif-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-[#1D1D1F] mb-4"
            style={{ animationDelay: '0.4s' }}>
          Daily SBAs. Straight<br className="hidden sm:block" /> to{' '}
          <span className="italic" style={{ color: G }}>your inbox.</span>
        </h1>

        <p className="stagger-in text-[17px] sm:text-[19px] text-[#6E6E73] leading-relaxed max-w-xl mx-auto mb-5"
           style={{ animationDelay: '0.6s' }}>
          Choose your rotation. One clinical SBA every morning, completely free.
        </p>

        <p className="stagger-in text-[13px] text-[#6E6E73] tracking-wide"
           style={{ animationDelay: '0.8s' }}>
          UKMLA-style SBAs{' '}
          <span style={{ color: G }}>·</span> Full explanations{' '}
          <span style={{ color: G }}>·</span> Pick your rotation
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Demo                            ─── */
/* ═══════════════════════════════════════ */
function DemoSection() {
  const ref = useStaggerReveal<HTMLDivElement>();
  return (
    <section id="demo" className="bg-[#1A2332] relative overflow-hidden py-14 sm:py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(26,107,82,0.18),transparent_70%)] pointer-events-none" />
      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="lg:w-[340px] flex-shrink-0 text-center lg:text-left">
            <h2 data-stagger className="stagger-item font-serif-display text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.1] text-white mb-4">
              This is what lands in your inbox.
            </h2>
            <p data-stagger className="stagger-item text-[15px] text-[#8899A6] leading-relaxed mb-5">
              Select your answer, eliminate distractors, test your reasoning.
            </p>
            <a data-stagger href="#subscribe" className="stagger-item cta-link text-[15px] font-medium inline-block transition-colors" style={{ color: '#5CC9A7' }}>
              Start receiving <span className="cta-chevron">›</span>
            </a>
          </div>
          <div data-stagger className="stagger-item flex-1 w-full max-w-[520px]">
            <QuestionCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Question Card                   ─── */
/* ═══════════════════════════════════════ */
function QuestionCard() {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          setTimeout(() => setGreetingVisible(true), 300);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const q = SAMPLE_QUESTION;

  return (
    <div ref={cardRef} className="demo-stagger bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F5F5F7] border-b border-black/[0.06]">
        <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
        <span className="ml-3 text-[11px] text-[#86868B]">UKMLA Daily — Inbox</span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Greeting */}
        <div className={`transition-all duration-500 ${greetingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <p className="font-serif-display italic text-[15px] text-[#6E6E73] mb-4">Good morning —</p>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <span className="px-2.5 py-1 bg-[#E8F4F0] text-[#0F6E56] rounded-md text-[11px] font-semibold">{q.specialty}</span>
          <span className="px-2.5 py-1 bg-[#FEF3E8] text-[#9A5B1D] rounded-md text-[11px] font-semibold">{q.difficulty}</span>
        </div>

        {/* Vignette — Crimson Pro */}
        <p className="font-crimson text-[15px] sm:text-[16px] leading-[1.7] text-[#1D1D1F] mb-5">
          {q.vignette}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isCorrect = opt.letter === q.correct;
            const isWrongPick = revealed && selected === opt.letter && !isCorrect;
            const isCorrectReveal = revealed && isCorrect;
            const shouldFade = revealed && !isCorrect && selected !== opt.letter;

            let borderCls = 'border-[#E5E5EA]';
            let bgCls = 'bg-white';
            let textCls = 'text-[#1D1D1F]';
            let letterCls = 'bg-[#F5F5F7] text-[#6E6E73]';

            if (!revealed && selected === opt.letter) {
              borderCls = 'border-[#1A6B52]';
              bgCls = 'bg-[#F0F7F4]';
              letterCls = 'bg-[#1A6B52] text-white';
              textCls = 'text-[#1D1D1F]';
            }
            if (isCorrectReveal) {
              borderCls = 'border-[#1A6B52]';
              bgCls = 'bg-[#F0F7F4]';
              letterCls = 'bg-[#1A6B52] text-white';
              textCls = 'text-[#1A6B52]';
            }
            if (isWrongPick) {
              borderCls = 'border-[#FF3B30]';
              bgCls = 'bg-[#FFF5F5]';
              letterCls = 'bg-[#FF3B30] text-white';
              textCls = 'text-[#FF3B30]';
            }

            return (
              <button
                key={opt.letter}
                onClick={() => { if (!revealed) setSelected(opt.letter); }}
                disabled={revealed}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 min-h-[44px] transition-all duration-300 ${bgCls} ${borderCls} ${
                  shouldFade ? 'slide-left-fade' : ''
                } ${!revealed ? 'cursor-pointer active:scale-[0.99]' : ''}`}
                style={shouldFade ? { animationDelay: `${i * 0.06}s` } : undefined}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${letterCls}`}>
                  {isCorrectReveal ? '✓' : isWrongPick ? '✗' : opt.letter}
                </span>
                <span className={`text-[13px] sm:text-[14px] pt-0.5 transition-colors duration-300 ${textCls}`}>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {!revealed && !selected && (
          <p className="breathe text-center text-[12px] text-[#86868B] mt-4">Pick an answer</p>
        )}

        {/* Submit */}
        {!revealed && selected && (
          <button
            onClick={() => setRevealed(true)}
            className="btn-shine mt-4 w-full py-3 rounded-xl text-white text-[14px] font-semibold transition-all active:scale-[0.99]"
            style={{ backgroundColor: G }}
          >
            Check Answer
          </button>
        )}

        {/* Explanation */}
        {revealed && (
          <div className="expand-in mt-4 p-4 rounded-xl bg-[#F0F7F4]" style={{ borderLeft: `3px solid ${G}` }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: G }}>Explanation</p>
            <p className="font-crimson text-[13px] text-[#3D3D3D] leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Customise                       ─── */
/* ═══════════════════════════════════════ */
function CustomiseSection() {
  const leftRef = useStaggerReveal<HTMLDivElement>();
  const rightRef = useStaggerReveal<HTMLDivElement>();

  return (
    <section className="bg-[#F5F5F7] pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div ref={leftRef}>
            <h2 data-stagger className="stagger-item font-serif-display text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.1] text-[#1D1D1F] mb-3">
              Pick your rotation.
            </h2>
            <p data-stagger className="stagger-item text-[14px] text-[#6E6E73] mb-3">
              Customise what you receive after subscribing.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <span data-stagger className="stagger-item px-4 py-2.5 rounded-full text-[13px] font-medium text-white" style={{ backgroundColor: G }}>
                All topics
              </span>
              {SPECIALTIES.map(s => (
                <span key={s} data-stagger className="stagger-item px-4 py-2.5 rounded-full text-[13px] font-medium bg-white text-[#1D1D1F] border border-[#D2D2D7]">
                  {s}
                </span>
              ))}
            </div>
            <p data-stagger className="stagger-item text-[12px] italic text-[#86868B] mt-3">
              More rotations coming soon
            </p>
          </div>

          <div ref={rightRef} className="md:pt-2">
            <h3 data-stagger className="stagger-item font-serif-display text-[1.5rem] leading-[1.2] text-[#1D1D1F] mb-4">
              One question, every morning.
            </h3>
            <p data-stagger className="stagger-item text-[15px] text-[#6E6E73] leading-relaxed mb-6">
              A clinical vignette with five options, written to match the style and difficulty of the real UKMLA Applied Knowledge Test. Select your answer, eliminate distractors, then reveal the full explanation with guidelines.
            </p>
            <div className="flex gap-8">
              <div data-stagger className="stagger-item">
                <p className="font-serif-display text-[28px] text-[#1D1D1F]">~2 min</p>
                <p className="text-[12px] text-[#86868B]">Per question</p>
              </div>
              <div data-stagger className="stagger-item">
                <p className="font-serif-display text-[28px] text-[#1D1D1F]">£0</p>
                <p className="text-[12px] text-[#86868B]">Always</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Signup                          ─── */
/* ═══════════════════════════════════════ */
function SignupSection() {
  const ref = useStaggerReveal<HTMLDivElement>();
  const [email, setEmail] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set(SPECIALTIES));
  const [lastOneWarning, setLastOneWarning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formVisible, setFormVisible] = useState(true);

  const toggleSpecialty = useCallback((s: string) => {
    setSelectedSpecialties(prev => {
      const next = new Set(prev);
      if (next.has(s)) {
        if (next.size <= 1) {
          setLastOneWarning(true);
          setTimeout(() => setLastOneWarning(false), 2000);
          return prev;
        }
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, specialties: Array.from(selectedSpecialties) }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormVisible(false);
        setTimeout(() => setStatus('success'), 300);
        setEmail('');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }, [email, selectedSpecialties]);

  return (
    <section id="subscribe" className="bg-[#F5F5F7] border-t border-black/[0.04] pt-10 sm:pt-14 pb-14 sm:pb-18">
      <div ref={ref} className="max-w-xl mx-auto px-5 text-center">
        <h2 data-stagger className="stagger-item font-serif-display text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-[#1D1D1F] mb-3">
          Start tomorrow morning.
        </h2>
        <p data-stagger className="stagger-item text-[15px] text-[#6E6E73] mb-8">
          Free forever. Unsubscribe anytime.
        </p>

        {status !== 'success' && (
          <div data-stagger className="stagger-item">
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-300 ${formVisible ? '' : 'shrink-away pointer-events-none'}`}
            >
              {/* Specialty chips */}
              <p className="text-[13px] text-[#6E6E73] mb-2.5 font-medium">Choose your specialties:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {SPECIALTIES.map(s => {
                  const active = selectedSpecialties.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className="px-3.5 py-2 rounded-full text-[13px] font-medium border transition-all duration-200 min-h-[36px] select-none active:scale-[0.96]"
                      style={{
                        backgroundColor: active ? G : 'transparent',
                        color: active ? '#fff' : '#6E6E73',
                        borderColor: active ? G : '#D2D2D7',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {lastOneWarning && (
                <p className="text-[12px] text-[#FF9500] font-medium mb-3 transition-opacity">Select at least one specialty</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] placeholder-[#86868B] focus:outline-none transition-all text-[16px] min-h-[44px]"
                  style={{ boxShadow: 'none' }}
                  onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = `0 0 0 3px rgba(26,107,82,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = '#D2D2D7'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-shine text-white font-semibold px-8 py-3.5 rounded-xl transition-all min-h-[44px] text-[15px] disabled:opacity-60 active:scale-[0.97]"
                  style={{ backgroundColor: G }}
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Subscribing...
                    </span>
                  ) : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-3 text-[13px] text-[#FF3B30] font-medium">{errorMsg}</p>
              )}
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="pop-in">
            <p className="text-[21px] font-semibold text-[#1D1D1F] mb-1">You&apos;re in!</p>
            <p className="text-[15px] text-[#6E6E73]">See you tomorrow morning ☀️</p>
          </div>
        )}

        <p data-stagger className="stagger-item mt-8 text-[12px] text-[#86868B]">
          Join medical students across the UK.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Footer                          ─── */
/* ═══════════════════════════════════════ */
function FooterSection() {
  const ref = useScrollReveal<HTMLElement>();
  return (
    <footer ref={ref} className="scroll-reveal bg-[#F5F5F7] border-t border-black/[0.06] py-10">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <p className="font-serif-display text-[15px] italic text-[#86868B] mb-4">
          Built by a medical student, for medical students.
        </p>
        <a href="/privacy" className="text-[12px] transition-colors" style={{ color: G }}>
          Privacy Policy
        </a>
        <p className="text-[11px] text-[#86868B] max-w-lg mx-auto leading-relaxed mt-4">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
