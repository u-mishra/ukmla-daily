'use client';

export default function EmailMockup() {
  return (
    <div className="bg-white/80 dark:bg-gray-900/60 glass-card rounded-2xl border border-gray-200/60 dark:border-gray-700/40 shadow-lg shadow-gray-900/[0.04] dark:shadow-black/20 overflow-hidden hover:shadow-xl transition-shadow duration-500">
      {/* macOS window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200/50 dark:border-gray-700/40">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-gray-400 dark:text-gray-500 font-medium">Inbox</span>
      </div>

      <div className="divide-y divide-gray-100/80 dark:divide-gray-800/60">
        {/* UKMLA Daily — newest, 7:00 AM */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 animate-slide-in delay-300">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse-dot" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white">UKMLA Daily</span>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">7:00 AM</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              Day 47 — Can you spot the diagnosis?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
              A 34-year-old woman presents with fatigue, weight gain, and cold intolerance...
            </p>
          </div>
        </div>

        {/* Amazon — 6:45 AM */}
        <div className="flex items-center gap-3 px-4 py-3 opacity-35">
          <div className="w-2 h-2 rounded-full bg-transparent" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Amazon</span>
              <span className="text-xs text-gray-400">6:45 AM</span>
            </div>
            <p className="text-sm text-gray-400 truncate">Your order has been dispatched</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 truncate hidden sm:block">Track your package — estimated delivery tomorrow...</p>
          </div>
        </div>

        {/* Spotify — 6:30 AM */}
        <div className="flex items-center gap-3 px-4 py-3 opacity-35">
          <div className="w-2 h-2 rounded-full bg-transparent" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Spotify</span>
              <span className="text-xs text-gray-400">6:30 AM</span>
            </div>
            <p className="text-sm text-gray-400 truncate">Your Discover Weekly is ready</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 truncate hidden sm:block">We made you a new playlist based on your recent listening...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
