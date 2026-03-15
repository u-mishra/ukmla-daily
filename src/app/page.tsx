import DarkModeToggle from '@/components/DarkModeToggle';
import SubscribeForm from '@/components/SubscribeForm';
import SampleQuestion from '@/components/SampleQuestion';
import EmailMockup from '@/components/EmailMockup';

const DISCLAIMER =
  'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <DarkModeToggle />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-12 sm:py-20">
        {/* Logo */}
        <div className="animate-fade-up flex items-center justify-center gap-3 mb-12">
          <div className="w-3 h-3 rounded-full gradient-bg animate-pulse-dot" />
          <span className="text-sm font-bold tracking-[0.25em] uppercase gradient-text">
            UKMLA Daily
          </span>
        </div>

        {/* Headline */}
        <div className="animate-fade-up delay-100 text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            One question.
            <br />
            <span className="gradient-text">Every morning.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
            A free daily UKMLA practice question straight to your inbox. Two minutes. Build the habit.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="animate-fade-up delay-200 mb-8" id="signup">
          <div className="gradient-bg-subtle rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800/50">
            <SubscribeForm id="subscribe-form" />

            {/* Avatar stack */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <div className="flex -space-x-2">
                {[
                  { initial: 'P', bg: 'bg-indigo-500' },
                  { initial: 'J', bg: 'bg-purple-500' },
                  { initial: 'Z', bg: 'bg-pink-500' },
                  { initial: 'L', bg: 'bg-amber-500' },
                  { initial: '+', bg: 'bg-gray-400' },
                ].map((avatar) => (
                  <div
                    key={avatar.initial}
                    className={`w-7 h-7 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-950`}
                  >
                    {avatar.initial}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Join <strong className="text-gray-700 dark:text-gray-300">50+</strong> medical students revising daily
              </span>
            </div>
          </div>
        </div>

        {/* Live counter pill */}
        <div className="animate-fade-up delay-300 flex justify-center mb-16">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-600 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">47</strong> answered today</span>
            </span>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
            <span className="text-gray-600 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">64%</strong> got it right</span>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
            <span className="text-gray-600 dark:text-gray-400">🔥 <strong className="text-gray-800 dark:text-gray-200">12</strong> day streak</span>
          </div>
        </div>

        {/* Section: Try today's question */}
        <div className="animate-fade-up delay-400 flex items-center gap-4 mb-6">
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Try today&apos;s question
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="animate-fade-up delay-500 mb-16">
          <SampleQuestion />
        </div>

        {/* Section: What lands in your inbox */}
        <div className="animate-fade-up flex items-center gap-4 mb-6">
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
            What lands in your inbox
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="animate-fade-up delay-100 mb-16">
          <EmailMockup />
        </div>

        {/* Testimonials */}
        <div className="animate-fade-up delay-200 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
            <div className="text-yellow-400 mb-3">★★★★★</div>
            <p className="font-serif italic text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
              &ldquo;I do one question every morning with my coffee. It&apos;s become part of my routine and I&apos;ve noticed a real difference in my clinical reasoning.&rdquo;
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Priya K.</p>
            <p className="text-xs text-gray-500">Year 4, King&apos;s College London</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
            <div className="text-yellow-400 mb-3">★★★★★</div>
            <p className="font-serif italic text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
              &ldquo;The explanations are brilliant — concise but actually helpful. Way better than grinding through a question bank with no context.&rdquo;
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">James L.</p>
            <p className="text-xs text-gray-500">Year 5, University of Edinburgh</p>
          </div>
        </div>

        {/* Tomorrow teaser */}
        <div className="animate-fade-up delay-300 text-center mb-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tomorrow&apos;s question:</span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold">
              ENT
            </span>
            <a
              href="#signup"
              className="text-sm font-semibold gradient-text hover:opacity-80 transition-opacity"
            >
              Sign up so you don&apos;t miss it →
            </a>
          </div>
        </div>

        {/* Second CTA */}
        <div className="animate-fade-up text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join the <span className="gradient-text">daily habit.</span>
          </h2>
          <div className="max-w-md mx-auto">
            <SubscribeForm />
          </div>
        </div>

        {/* Stats row */}
        <div className="animate-fade-up delay-100 grid grid-cols-3 gap-3 sm:gap-4 mb-16">
          {[
            { top: '7am', bottom: 'Every day' },
            { top: '2 min', bottom: 'Per question' },
            { top: '£0', bottom: 'Free forever' },
          ].map((stat) => (
            <div key={stat.bottom} className="text-center py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-xl sm:text-2xl font-bold gradient-text">{stat.top}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.bottom}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-gray-200 dark:border-gray-800 pt-8 pb-12">
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
      </div>
    </main>
  );
}
