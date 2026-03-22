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
        <div className="relative z-10 pt-28 sm:pt-40 max-w-2xl mx-auto px-5">
          {/* Headline */}
          <ScrollReveal>
            <div className="text-center mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5 text-balance leading-[1.08]">
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
            <div className="flex items-center justify-center gap-3 sm:gap-5 mb-10 py-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                  color: 'text-indigo-500 bg-indigo-100/80 dark:bg-indigo-950/50',
                  label: 'Drop your email',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  color: 'text-sky-500 bg-sky-100/80 dark:bg-sky-950/50',
                  label: 'Wake up to a question',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  ),
                  color: 'text-emerald-500 bg-emerald-100/80 dark:bg-emerald-950/50',
                  label: 'Learn why you were right (or wrong)',
                },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-2.5">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                    {step.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
                    {step.label}
                  </span>
                  {i < 2 && (
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 hidden sm:block ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            {/* Mobile-only labels */}
            <div className="grid grid-cols-3 gap-2 mb-10 sm:hidden -mt-6">
              {['Drop your email', 'Wake up to a question', 'Learn why'].map((label) => (
                <p key={label} className="text-[11px] text-center text-gray-500 dark:text-gray-500">{label}</p>
              ))}
            </div>
          </ScrollReveal>

          {/* Sample question — the centrepiece */}
          <ScrollReveal delay={2}>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Try today&apos;s question
            </p>
            <SampleQuestion />
          </ScrollReveal>
        </div>

        {/* Extra bottom padding for hero section */}
        <div className="h-16 sm:h-24" />
      </section>

      {/* ─── Social proof ─── */}
      <section className="py-20 sm:py-28 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-3 text-gray-900 dark:text-white tracking-tight">
            Loved by students
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-base sm:text-lg">
            What medical students are saying.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ScrollReveal delay={1}>
            <div className="bg-gradient-to-br from-amber-50/60 via-white to-white dark:from-amber-950/10 dark:via-gray-900/80 dark:to-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-amber-400 mb-3 text-sm tracking-wider">★★★★★</div>
              <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed mb-5">
                &ldquo;I do one question every morning with my coffee. It&apos;s become part of my routine and I&apos;ve noticed a real difference in my clinical reasoning.&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Priya K.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Year 4, King&apos;s College London</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <div className="bg-gradient-to-br from-blue-50/60 via-white to-white dark:from-blue-950/10 dark:via-gray-900/80 dark:to-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-amber-400 mb-3 text-sm tracking-wider">★★★★★</div>
              <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed mb-5">
                &ldquo;The explanations are brilliant — concise but actually helpful. Way better than grinding through a question bank with no context.&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">James L.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Year 5, University of Edinburgh</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Email mockup ─── */}
      <section className="pb-20 sm:pb-28 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">
            What lands in your inbox
          </p>
          <EmailMockup />
        </ScrollReveal>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative cta-gradient py-20 sm:py-28 overflow-hidden" id="subscribe">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto px-5 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              Start your daily habit.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-base sm:text-lg max-w-md mx-auto">
              Join medical students across the UK. Two minutes a day, completely free.
            </p>
            <div className="max-w-md mx-auto">
              <SubscribeForm id="subscribe-form" />
            </div>

            {/* Avatar stack */}
            <div className="flex items-center justify-center gap-2.5 mt-8">
              <div className="flex -space-x-2">
                {[
                  { initial: 'P', bg: 'bg-indigo-500' },
                  { initial: 'J', bg: 'bg-sky-500' },
                  { initial: 'Z', bg: 'bg-amber-500' },
                  { initial: 'L', bg: 'bg-emerald-500' },
                ].map((avatar) => (
                  <div
                    key={avatar.initial}
                    className={`w-7 h-7 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-900 shadow-sm`}
                  >
                    {avatar.initial}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Join <strong className="text-gray-700 dark:text-gray-300">50+</strong> subscribers
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="max-w-2xl mx-auto px-5 py-14 text-center border-t border-gray-200/60 dark:border-gray-800/60">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Built by a medical student, for medical students.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
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
