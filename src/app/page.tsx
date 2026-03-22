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

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-8 sm:pb-12 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 text-balance">
              One question.{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Every morning.</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
              A free daily UKMLA practice question straight to your inbox.
            </p>
          </div>
        </ScrollReveal>

        {/* Sample question — the star of the page */}
        <ScrollReveal>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Try today&apos;s question
            </p>
            <SampleQuestion />
          </div>
        </ScrollReveal>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-gray-50/80 dark:bg-gray-900/40">
        <div className="max-w-2xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 text-gray-900 dark:text-white">
              How it works
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            <ScrollReveal delay={1}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Subscribe</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email. That&apos;s it.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">7am, every day</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">One SBA lands in your inbox.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Reveal the answer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Learn from detailed explanations.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 sm:py-24 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="text-amber-400 mb-3 text-sm tracking-wider">★★★★★</div>
              <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed mb-4">
                &ldquo;I do one question every morning with my coffee. It&apos;s become part of my routine and I&apos;ve noticed a real difference in my clinical reasoning.&rdquo;
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Priya K.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Year 4, King&apos;s College London</p>
            </div>
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="text-amber-400 mb-3 text-sm tracking-wider">★★★★★</div>
              <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed mb-4">
                &ldquo;The explanations are brilliant — concise but actually helpful. Way better than grinding through a question bank with no context.&rdquo;
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">James L.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Year 5, University of Edinburgh</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Email mockup */}
      <section className="pb-16 sm:pb-24 max-w-2xl mx-auto px-5">
        <ScrollReveal>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            What lands in your inbox
          </p>
          <EmailMockup />
        </ScrollReveal>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-24 bg-gray-50/80 dark:bg-gray-900/40" id="subscribe">
        <div className="max-w-xl mx-auto px-5 text-center">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
              Start your daily habit.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-base">
              Join medical students across the UK. Two minutes a day, completely free.
            </p>
            <div className="max-w-md mx-auto">
              <SubscribeForm id="subscribe-form" />
            </div>

            {/* Avatar stack */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="flex -space-x-2">
                {[
                  { initial: 'P', bg: 'bg-indigo-500' },
                  { initial: 'J', bg: 'bg-sky-500' },
                  { initial: 'Z', bg: 'bg-amber-500' },
                  { initial: 'L', bg: 'bg-emerald-500' },
                ].map((avatar) => (
                  <div
                    key={avatar.initial}
                    className={`w-7 h-7 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold ring-2 ring-gray-50 dark:ring-gray-900`}
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

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-5 py-12 text-center border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Built by a medical student, for medical students.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
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
