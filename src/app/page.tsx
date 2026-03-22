import NavBar from '@/components/NavBar';
import SubscribeForm from '@/components/SubscribeForm';
import SampleQuestion from '@/components/SampleQuestion';
import EmailMockup from '@/components/EmailMockup';
import ScrollReveal from '@/components/ScrollReveal';

const DISCLAIMER =
  'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

export default function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* ─── Hero ─── */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="hero-glow" />
        <div className="hero-dots" />
        <div className="relative z-10 pt-24 sm:pt-36 max-w-2xl mx-auto px-5">
          {/* Headline */}
          <ScrollReveal>
            <div className="text-center mb-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 text-balance leading-[1.08]">
                Master the{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">UKMLA</span>
                ,<br />one question at a time.
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
                One clinical SBA in your inbox every morning at 7am. Two&nbsp;minutes. No app. No login. Just the habit that compounds.
              </p>
            </div>
          </ScrollReveal>

          {/* ─── How it works strip ─── */}
          <ScrollReveal delay={1}>
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-3 mb-2">
              {[
                { num: '1', label: 'Drop your email' },
                { num: '2', label: 'Wake up to a question' },
                { num: '3', label: 'Learn why' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step.num}
                  </span>
                  <span className="text-[11px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {step.label}
                  </span>
                  {i < 2 && (
                    <span className="text-gray-300 dark:text-gray-600 text-[10px] sm:text-xs mx-0.5 sm:mx-1">›</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Credibility strip */}
          <ScrollReveal delay={1}>
            <p className="text-center text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mb-6 tracking-wide">
              UKMLA-style SBAs&ensp;·&ensp;Detailed explanations&ensp;·&ensp;Built for busy med students&ensp;·&ensp;Free forever
            </p>
          </ScrollReveal>

          {/* Sample question — the centrepiece */}
          <ScrollReveal delay={2}>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Try today&apos;s question
            </p>
            <SampleQuestion />
          </ScrollReveal>
        </div>

        <div className="h-12 sm:h-16" />
      </section>

      {/* ─── Email mockup ─── */}
      <section className="section-warm py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-5">
          <ScrollReveal>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              What lands in your inbox
            </p>
            <EmailMockup />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative cta-gradient py-14 sm:py-20 overflow-hidden" id="subscribe">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto px-5 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              Start your daily habit.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-base sm:text-lg max-w-md mx-auto">
              Join medical students across the UK. Two minutes a day, completely free.
            </p>
            <div className="max-w-md mx-auto">
              <SubscribeForm id="subscribe-form" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="max-w-2xl mx-auto px-5 py-10 text-center border-t border-gray-200/60 dark:border-gray-800/60">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Built by a medical student, for medical students.
        </p>
        <div className="flex items-center justify-center gap-4 mb-5">
          <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
            Privacy Policy
          </a>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 max-w-lg mx-auto leading-relaxed">
          {DISCLAIMER}
        </p>
      </footer>
    </main>
  );
}
