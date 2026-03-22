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
        <div className="relative z-10 pt-32 sm:pt-44 pb-16 sm:pb-24 max-w-2xl mx-auto px-5">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5 text-balance leading-[1.08]">
                One question.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  Every morning.
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl max-w-lg mx-auto leading-relaxed">
                A free daily UKMLA practice question straight to your inbox. Two minutes. Build the habit.
              </p>
            </div>
          </ScrollReveal>

          {/* Sample question — the centrepiece */}
          <ScrollReveal delay={1}>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">
              Try today&apos;s question
            </p>
            <SampleQuestion />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="section-warm py-20 sm:py-32">
        <div className="max-w-2xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-gray-900 dark:text-white tracking-tight">
              How it works
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-14 text-base sm:text-lg">
              Three steps. No catches.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            <ScrollReveal delay={1}>
              <div className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/15 transition-all duration-300">
                  <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-[17px]">Subscribe</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Enter your email. That&apos;s it.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-500/15 transition-all duration-300">
                  <svg className="w-7 h-7 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-[17px]">7am, every day</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">One SBA lands in your inbox.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <div className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/15 transition-all duration-300">
                  <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-[17px]">Reveal the answer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Learn from detailed explanations.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── Social proof ─── */}
      <section className="py-20 sm:py-32 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-gray-900 dark:text-white tracking-tight">
            Loved by students
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-base sm:text-lg">
            What medical students are saying.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ScrollReveal delay={1}>
            <div className="bg-gradient-to-br from-amber-50/50 via-white to-white dark:from-amber-950/10 dark:via-gray-900/80 dark:to-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
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
            <div className="bg-gradient-to-br from-blue-50/50 via-white to-white dark:from-blue-950/10 dark:via-gray-900/80 dark:to-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
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
      <section className="pb-20 sm:pb-32 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">
            What lands in your inbox
          </p>
          <EmailMockup />
        </ScrollReveal>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative section-warm py-20 sm:py-32 overflow-hidden" id="subscribe">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto px-5 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              Start your daily habit.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-base sm:text-lg">
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
