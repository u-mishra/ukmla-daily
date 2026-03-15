import { Metadata } from 'next';
import DarkModeToggle from '@/components/DarkModeToggle';

export const metadata: Metadata = {
  title: 'Privacy Policy — UKMLA Daily',
  description: 'Privacy policy for UKMLA Daily email newsletter.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <DarkModeToggle />

      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-20">
        <a href="/" className="flex items-center gap-3 mb-10">
          <div className="w-3 h-3 rounded-full gradient-bg animate-pulse-dot" />
          <span className="text-sm font-bold tracking-[0.25em] uppercase gradient-text">
            UKMLA Daily
          </span>
        </a>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <p><strong>Last updated:</strong> March 2026</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Who we are</h2>
          <p>
            UKMLA Daily is a free email newsletter providing daily medical revision questions for UK medical students. We are based in the United Kingdom.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">What data we collect</h2>
          <p>We collect only the following personal data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Email address</strong> — provided by you when you subscribe.</li>
            <li><strong>Subscription date</strong> — when you signed up.</li>
            <li><strong>Answer interaction data</strong> — whether you answered a question correctly (anonymous, optional).</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Why we collect it</h2>
          <p>
            We use your email address solely to send you daily UKMLA practice questions and occasional service updates. We use anonymised answer data to show aggregate statistics (e.g., &ldquo;68% got this right&rdquo;).
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Legal basis for processing</h2>
          <p>
            We process your data based on your consent, which you provide by entering your email address and subscribing. You may withdraw consent at any time by unsubscribing.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Data sharing</h2>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes. Your email is stored securely in our database (hosted by Supabase) and processed by Resend for email delivery. Both services act as data processors on our behalf.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Data retention</h2>
          <p>
            We retain your email address for as long as you are subscribed. If you unsubscribe, we mark your record as inactive. You may request full deletion at any time.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">How to unsubscribe</h2>
          <p>
            Every email we send contains an unsubscribe link at the bottom. You can also unsubscribe by emailing us at <a href="mailto:contact@ukmladaily.co.uk" className="text-purple-600 dark:text-purple-400 underline">contact@ukmladaily.co.uk</a>.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Your rights (under UK GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with the ICO (Information Commissioner&apos;s Office)</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Data deletion requests</h2>
          <p>
            To request complete deletion of your data, email <a href="mailto:contact@ukmladaily.co.uk" className="text-purple-600 dark:text-purple-400 underline">contact@ukmladaily.co.uk</a> with the subject line &ldquo;Data Deletion Request&rdquo;. We will process your request within 30 days.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Cookies</h2>
          <p>
            We use only essential cookies for site functionality (e.g., dark mode preference stored in localStorage). We do not use analytics or tracking cookies.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8">Contact</h2>
          <p>
            For any privacy-related questions, contact us at: <a href="mailto:contact@ukmladaily.co.uk" className="text-purple-600 dark:text-purple-400 underline">contact@ukmladaily.co.uk</a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <a href="/" className="text-sm gradient-text font-semibold hover:opacity-80">
            ← Back to UKMLA Daily
          </a>
        </div>
      </div>
    </main>
  );
}
