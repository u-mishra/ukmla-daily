'use client';

import { useEffect, useState } from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border-b border-gray-200/40 dark:border-gray-800/40 shadow-sm shadow-black/[0.03]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
        <span className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white">
          UKMLA Daily
        </span>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <a
            href="#subscribe"
            className="text-sm font-semibold px-4 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all duration-200"
          >
            Subscribe
          </a>
        </div>
      </div>
    </nav>
  );
}
