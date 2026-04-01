'use client';

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';

const DISCLAIMER =
  'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

const SPECIALTIES = ['ENT', 'Haematology', 'Neurology', 'Renal', 'Infectious Diseases'];

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

/* ─── Intersection Observer Hook ─── */
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

/* ─── Stagger children on scroll ─── */
function useStaggerReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = el.querySelectorAll('[data-stagger]');
          children.forEach((child, i) => {
            const htmlChild = child as HTMLElement;
            htmlChild.style.transitionDelay = `${i * 90}ms`;
            htmlChild.classList.add('stagger-visible');
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
/* ─── Main Page                       ─── */
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
      {/* ─── Nav ─── */}
      <nav className={`nav-slide fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navScrolled
          ? 'bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/[0.06]'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-tight text-[#1D1D1F]">UKMLA Daily</span>
          <a
            href="#subscribe"
            className="cta-link text-[13px] font-medium text-[#0066CC] hover:text-[#0055AA] transition-colors"
          >
            Subscribe free <span className="cta-chevron">›</span>
          </a>
        </div>
      </nav>

      <HeroSection />
      <DemoSection />
      <CustomiseSection />
      <SignupSection />

      {/* ─── Footer ─── */}
      <FooterSection />
    </main>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Hero Section                    ─── */
/* ═══════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="bg-[#F5F5F7] pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <p className="stagger-in text-[13px] font-semibold tracking-[0.2em] uppercase text-[#86868B] mb-4"
           style={{ animationDelay: '0.2s' }}>
          UKMLA Daily
        </p>

        <h1 className="clip-reveal font-serif-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-[#1D1D1F] mb-4"
            style={{ animationDelay: '0.4s' }}>
          Daily SBAs. Straight<br className="hidden sm:block" /> to your inbox.
        </h1>

        <p className="stagger-in text-[17px] sm:text-[19px] text-[#86868B] leading-relaxed max-w-xl mx-auto mb-5"
           style={{ animationDelay: '0.6s' }}>
          Choose your rotation. Wake up to high-yield revision daily, completely free.
        </p>

        <p className="stagger-in text-[13px] text-[#86868B] tracking-wide"
           style={{ animationDelay: '0.8s' }}>
          UKMLA-style SBAs · Full explanations · Pick your rotation · Always free
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Demo Section                    ─── */
/* ═══════════════════════════════════════ */
function DemoSection() {
  const sectionRef = useStaggerReveal<HTMLDivElement>();

  return (
    <section id="demo" className="bg-[#1D1D1F] relative overflow-hidden py-14 sm:py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,102,204,0.08),transparent_70%)] pointer-events-none" />

      <div ref={sectionRef} className="relative z-10 max-w-6xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-[340px] flex-shrink-0 text-center lg:text-left">
            <h2 data-stagger className="stagger-item font-serif-display text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.1] text-white mb-5">
              This is what lands in your inbox.
            </h2>
            <p data-stagger className="stagger-item text-[15px] text-[#86868B] leading-relaxed mb-6">
              A clinical vignette. Five options. Select your answer, eliminate distractors, test your reasoning — then reveal the full explanation.
            </p>
            <a data-stagger href="#subscribe" className="stagger-item cta-link text-[15px] font-medium text-[#2997FF] hover:text-[#6CB4FF] transition-colors inline-block">
              Start receiving <span className="cta-chevron">›</span>
            </a>
          </div>

          <div data-stagger className="stagger-item flex-1 w-full max-w-[520px]">
            <InteractiveQuestionCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Interactive Question Card       ─── */
/* ═══════════════════════════════════════ */
function InteractiveQuestionCard() {
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

  const handleSelect = (letter: string) => {
    if (!revealed) setSelected(letter);
  };

  const handleReveal = () => {
    if (selected) setRevealed(true);
  };

  const q = SAMPLE_QUESTION;

  return (
    <div ref={cardRef} className="demo-stagger bg-[#2C2C2E] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#3A3A3C] border-b border-white/[0.06]">
        <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
        <span className="ml-3 text-[11px] text-[#86868B]">UKMLA Daily — Inbox</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className={`transition-all duration-500 ${greetingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <p className="text-[15px] text-[#86868B] mb-4">Good morning —</p>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-2.5 py-1 bg-[#0066CC]/20 text-[#2997FF] rounded-md text-[11px] font-semibold">{q.specialty}</span>
          <span className="px-2.5 py-1 bg-[#FF9500]/20 text-[#FF9F0A] rounded-md text-[11px] font-semibold">{q.difficulty}</span>
        </div>

        <p className="font-serif-display text-[14px] sm:text-[15px] leading-relaxed text-[#E5E5EA] mb-5">
          {q.vignette}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isCorrect = opt.letter === q.correct;
            const isWrongPick = revealed && selected === opt.letter && !isCorrect;
            const isCorrectReveal = revealed && isCorrect;
            const shouldFade = revealed && !isCorrect && selected !== opt.letter;

            let bg = 'bg-[#3A3A3C]';
            let border = 'border-transparent';
            let textColor = 'text-[#E5E5EA]';
            let letterBg = 'bg-[#48484A] text-[#AEAEB2]';

            if (!revealed && selected === opt.letter) {
              bg = 'bg-[#0066CC]/15';
              border = 'border-[#0066CC]/40';
              letterBg = 'bg-[#0066CC] text-white';
              textColor = 'text-white';
            }
            if (isCorrectReveal) {
              bg = 'bg-[#30D158]/15';
              border = 'border-[#30D158]/40';
              letterBg = 'bg-[#30D158] text-white';
              textColor = 'text-[#30D158]';
            }
            if (isWrongPick) {
              bg = 'bg-[#FF453A]/10';
              border = 'border-[#FF453A]/40';
              letterBg = 'bg-[#FF453A] text-white';
              textColor = 'text-[#FF453A]';
            }

            return (
              <button
                key={opt.letter}
                onClick={() => handleSelect(opt.letter)}
                disabled={revealed}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 min-h-[44px] transition-all duration-300 ${bg} ${border} ${
                  shouldFade ? 'slide-left-fade' : ''
                } ${!revealed ? 'cursor-pointer active:scale-[0.99]' : ''}`}
                style={shouldFade ? { animationDelay: `${i * 0.06}s` } : undefined}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${letterBg}`}>
                  {isCorrectReveal ? '✓' : isWrongPick ? '✗' : opt.letter}
                </span>
                <span className={`text-[13px] sm:text-[14px] pt-0.5 transition-colors duration-300 ${textColor}`}>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {!revealed && !selected && (
          <p className="breathe text-center text-[12px] text-[#86868B] mt-4">Pick an answer</p>
        )}

        {!revealed && selected && (
          <button
            onClick={handleReveal}
            className="btn-shine mt-4 w-full py-3 rounded-xl bg-[#0066CC] text-white text-[14px] font-semibold transition-all active:scale-[0.99]"
          >
            Check Answer
          </button>
        )}

        {revealed && (
          <div className="expand-in mt-4 p-4 rounded-xl bg-[#1C3A2A] border border-[#30D158]/20">
            <p className="text-[11px] font-semibold text-[#30D158] uppercase tracking-wider mb-2">Explanation</p>
            <p className="text-[13px] text-[#A8D5BA] leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* ─── Customise Section               ─── */
/* ═══════════════════════════════════════ */
function CustomiseSection() {
  const leftRef = useStaggerReveal<HTMLDivElement>();
  const rightRef = useStaggerReveal<HTMLDivElement>();

  return (
    <section className="bg-[#F5F5F7] pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left — chip grid */}
          <div ref={leftRef}>
            <h2 data-stagger className="stagger-item font-serif-display text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.1] text-[#1D1D1F] mb-3">
              Pick your rotation.
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {SPECIALTIES.map(s => (
                <span
                  key={s}
                  data-stagger
                  className="stagger-item px-4 py-2.5 rounded-full text-[13px] font-medium bg-[#1D1D1F] text-white"
                >
                  {s}
                </span>
              ))}
            </div>
            <p data-stagger className="stagger-item text-[12px] text-[#86868B] mt-3">
              Current rotations — more coming soon
            </p>
          </div>

          {/* Right — description */}
          <div ref={rightRef} className="md:pt-2">
            <h3 data-stagger className="stagger-item font-serif-display text-[1.5rem] leading-[1.2] text-[#1D1D1F] mb-4">
              One question, every morning.
            </h3>
            <p data-stagger className="stagger-item text-[15px] text-[#86868B] leading-relaxed mb-6">
              A clinical vignette with five options, written to match the style and difficulty of the real UKMLA Applied Knowledge Test. Select your answer, eliminate distractors, then reveal the full explanation with guidelines.
            </p>
            <div className="flex gap-8">
              <div data-stagger className="stagger-item">
                <p className="text-[28px] font-semibold text-[#1D1D1F]">~2 min</p>
                <p className="text-[12px] text-[#86868B]">Per question</p>
              </div>
              <div data-stagger className="stagger-item">
                <p className="text-[28px] font-semibold text-[#1D1D1F]">£0</p>
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
/* ─── Signup Section                  ─── */
/* ═══════════════════════════════════════ */
function SignupSection() {
  const sectionRef = useStaggerReveal<HTMLDivElement>();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formVisible, setFormVisible] = useState(true);

  const handleSubmit = useCallback(async (e: FormEvent) => {
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
  }, [email]);

  return (
    <section id="subscribe" className="bg-[#F5F5F7] pt-10 sm:pt-14 pb-16 sm:pb-20">
      <div ref={sectionRef} className="max-w-xl mx-auto px-5 text-center">
        <h2 data-stagger className="stagger-item font-serif-display text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-[#1D1D1F] mb-3">
          Start tomorrow morning.
        </h2>
        <p data-stagger className="stagger-item text-[15px] text-[#86868B] mb-10">
          Free forever. Unsubscribe anytime.
        </p>

        {status !== 'success' && (
          <div data-stagger className="stagger-item">
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-300 ${formVisible ? '' : 'shrink-away pointer-events-none'}`}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all text-[16px] min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-shine bg-[#1D1D1F] text-white font-semibold px-8 py-3.5 rounded-xl transition-all min-h-[44px] text-[15px] disabled:opacity-60 active:scale-[0.98]"
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
            <p className="text-[21px] font-semibold text-[#1D1D1F] mb-1">You&apos;re in.</p>
            <p className="text-[15px] text-[#86868B]">See you at 7&nbsp;am.</p>
          </div>
        )}

        <p data-stagger className="stagger-item mt-10 text-[12px] text-[#86868B]">
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
        <a href="/privacy" className="text-[12px] text-[#86868B] hover:text-[#1D1D1F] transition-colors">
          Privacy Policy
        </a>
        <p className="text-[11px] text-[#86868B] max-w-lg mx-auto leading-relaxed mt-4">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
