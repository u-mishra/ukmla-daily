'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const ALL_SPECIALTIES = ['ENT', 'Haematology', 'Neurology', 'Renal', 'Infectious Diseases'] as const;

interface Stats {
  totalSubscribers: number;
  activeSubscribers: number;
  approvedQueue: number;
  pendingReview: number;
  totalSent: number;
  todayClicks: number;
}

interface Question {
  id: string;
  specialty: string;
  condition_name: string | null;
  difficulty: string;
  vignette: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
  status: string;
  created_at: string;
}

interface Analytics {
  overall: { totalResponses: number; overallPercent: number; avgTimeSeconds: number };
  specialtyBreakdown: Array<{ specialty: string; total: number; correct: number; percent: number }>;
  questionBreakdown: Array<{
    questionId: string; specialty: string; difficulty: string; vignette: string;
    correctAnswer: string; total: number; correct: number; percent: number;
    mostCommonWrong: { letter: string; count: number } | null;
    distribution: Record<string, number>;
  }>;
  subscriberBreakdown: Array<{ email: string; total: number; correct: number; percent: number }>;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'pending' | 'approved' | 'analytics'>('pending');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setStats(await res.json());
    }
  }, [password]);

  const fetchQuestions = useCallback(async () => {
    if (tab === 'analytics') return;
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, status: tab }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions);
      setSelectedIds(new Set());
    }
  }, [password, tab]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const res = await fetch('/api/admin/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAnalytics(await res.json());
    }
    setAnalyticsLoading(false);
  }, [password]);

  useEffect(() => {
    if (authed) {
      fetchStats();
      if (tab === 'analytics') {
        fetchAnalytics();
      } else {
        fetchQuestions();
      }
    }
  }, [authed, tab, fetchStats, fetchQuestions, fetchAnalytics]);

  const filteredQuestions = useMemo(() => {
    if (specialtyFilter === 'All') return questions;
    return questions.filter(q => q.specialty === specialtyFilter);
  }, [questions, specialtyFilter]);

  const specialtyCounts = useMemo(() => {
    const counts: Record<string, number> = { All: questions.length };
    for (const s of ALL_SPECIALTIES) counts[s] = 0;
    for (const q of questions) {
      counts[q.specialty] = (counts[q.specialty] || 0) + 1;
    }
    return counts;
  }, [questions]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [specialtyFilter]);

  const handleLogin = async () => {
    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setStats(await res.json());
    } else {
      setMessage('Incorrect password');
    }
  };

  const handleApprove = async (ids: string[]) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, questionIds: ids, action: 'approve' }),
    });
    if (res.ok) {
      setMessage(`Approved ${ids.length} question(s)`);
      fetchQuestions();
      fetchStats();
    }
  };

  const handleReject = async (ids: string[]) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, questionIds: ids, action: 'reject' }),
    });
    if (res.ok) {
      setMessage(`Rejected ${ids.length} question(s)`);
      setSelectedIds(new Set());
      fetchQuestions();
      fetchStats();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(`Failed to reject: ${data.error || 'unknown error'}`);
    }
  };

  const handleRevert = async (ids: string[]) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, questionIds: ids, action: 'revert' }),
    });
    if (res.ok) {
      setMessage(`Reverted ${ids.length} question(s) to pending`);
      setSelectedIds(new Set());
      fetchQuestions();
      fetchStats();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(`Failed to revert: ${data.error || 'unknown error'}`);
    }
  };

  const handleGenerate = async (regenerate = false) => {
    setLoading(true);
    setMessage(
      regenerate
        ? 'Deleting pending questions and regenerating...'
        : `Generating questions from ${ALL_SPECIALTIES.length} specialties (${ALL_SPECIALTIES.join(', ')})...`
    );
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, regenerate }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
    fetchQuestions();
    fetchStats();
  };

  const handleSendDaily = async () => {
    setLoading(true);
    setMessage('Sending daily email...');
    const res = await fetch('/api/send-daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
    fetchStats();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setMessage(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button onClick={handleLogin} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800">
            Login
          </button>
          {message && <p className="mt-3 text-sm text-red-500">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">UKMLA Daily Admin</h1>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to site</a>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: 'Total Subscribers', value: stats.totalSubscribers },
              { label: 'Active', value: stats.activeSubscribers },
              { label: 'Approved Queue', value: stats.approvedQueue },
              { label: 'Pending Review', value: stats.pendingReview },
              { label: 'Total Sent', value: stats.totalSent },
              { label: 'Clicks Today', value: stats.todayClicks },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => handleGenerate(false)}
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
            title={`Generates 2 questions per condition from: ${ALL_SPECIALTIES.join(', ')}`}
          >
            Generate Questions ({ALL_SPECIALTIES.length} specialties)
          </button>
          <button
            onClick={() => { if (confirm('This will delete all pending questions and regenerate them. Continue?')) handleGenerate(true); }}
            disabled={loading}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            Regenerate Pending
          </button>
          <button
            onClick={handleSendDaily}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Send Daily Email
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            {message}
          </div>
        )}

        {/* Main Tabs (Pending / Approved / Analytics) */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {(['pending', 'approved', 'analytics'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSpecialtyFilter('All'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'analytics' ? 'Analytics' : `${t.charAt(0).toUpperCase() + t.slice(1)} (${t === 'pending' ? stats?.pendingReview || 0 : stats?.approvedQueue || 0})`}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <AnalyticsPanel analytics={analytics} loading={analyticsLoading} />
        )}

        {/* Questions Tabs */}
        {tab !== 'analytics' && (
          <>
            {/* Specialty Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['All', ...ALL_SPECIALTIES].map(s => {
                const count = specialtyCounts[s] || 0;
                const isActive = specialtyFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSpecialtyFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
                    }`}
                  >
                    {s} ({count})
                  </button>
                );
              })}
            </div>

            {/* Bulk actions */}
            {filteredQuestions.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                  Select all ({filteredQuestions.length})
                </label>
                {selectedIds.size > 0 && tab === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(Array.from(selectedIds))}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Approve ({selectedIds.size})
                    </button>
                    <button
                      onClick={() => handleReject(Array.from(selectedIds))}
                      className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Reject ({selectedIds.size})
                    </button>
                  </>
                )}
                {selectedIds.size > 0 && tab === 'approved' && (
                  <button
                    onClick={() => handleRevert(Array.from(selectedIds))}
                    className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                  >
                    Revert to Pending ({selectedIds.size})
                  </button>
                )}
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-4">
              {filteredQuestions.length === 0 && (
                <p className="text-center text-gray-500 py-12">
                  No {specialtyFilter !== 'All' ? `${specialtyFilter} ` : ''}{tab} questions
                </p>
              )}
              {filteredQuestions.map(q => (
                <div key={q.id} className="bg-white rounded-xl border shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{q.specialty}</span>
                        {q.condition_name && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{q.condition_name}</span>
                        )}
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">{q.difficulty}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Answer: {q.correct_answer}</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{q.vignette}</p>
                      <div className="text-sm text-gray-600 space-y-1 mb-2">
                        <p><strong>A:</strong> {q.option_a}</p>
                        <p><strong>B:</strong> {q.option_b}</p>
                        <p><strong>C:</strong> {q.option_c}</p>
                        <p><strong>D:</strong> {q.option_d}</p>
                        <p><strong>E:</strong> {q.option_e}</p>
                      </div>
                      <p className="text-xs text-gray-500 italic">{q.explanation}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {tab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove([q.id])}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject([q.id])}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {tab === 'approved' && (
                        <button
                          onClick={() => handleRevert([q.id])}
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200"
                        >
                          Revert to Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Analytics Panel Component ─── */
function AnalyticsPanel({ analytics, loading }: { analytics: Analytics | null; loading: boolean }) {
  if (loading) {
    return <p className="text-center text-gray-500 py-12">Loading analytics...</p>;
  }

  if (!analytics || analytics.overall.totalResponses === 0) {
    return <p className="text-center text-gray-500 py-12">No response data yet. Analytics will appear once subscribers start answering questions.</p>;
  }

  const { overall, specialtyBreakdown, questionBreakdown, subscriberBreakdown } = analytics;
  const hardest = questionBreakdown.slice(0, 10);
  const mostEngaged = subscriberBreakdown.slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-3xl font-bold text-indigo-600">{overall.totalResponses}</p>
          <p className="text-xs text-gray-500">Total Responses</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-3xl font-bold text-green-600">{overall.overallPercent}%</p>
          <p className="text-xs text-gray-500">Overall Correct Rate</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-3xl font-bold text-orange-600">{overall.avgTimeSeconds}s</p>
          <p className="text-xs text-gray-500">Avg Time to Answer</p>
        </div>
      </div>

      {/* Per-specialty */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Correct Rate by Specialty</h3>
        <div className="space-y-2">
          {specialtyBreakdown.map(s => (
            <div key={s.specialty} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-40 flex-shrink-0">{s.specialty}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${s.percent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-16 text-right">{s.percent}%</span>
              <span className="text-xs text-gray-400 w-16 text-right">({s.total})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hardest questions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Hardest Questions (lowest % correct)</h3>
        <div className="space-y-3">
          {hardest.map((q, i) => (
            <div key={q.questionId} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">{q.specialty}</span>
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">{q.difficulty}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{q.vignette}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                  <span className="font-bold text-red-600">{q.percent}% correct</span>
                  <span>{q.total} responses</span>
                  <span>Correct: {q.correctAnswer}</span>
                  {q.mostCommonWrong && (
                    <span>Most picked wrong: {q.mostCommonWrong.letter} ({q.mostCommonWrong.count}x)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most engaged subscribers */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Most Engaged Subscribers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4 text-right">Answered</th>
                <th className="pb-2 pr-4 text-right">Correct</th>
                <th className="pb-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {mostEngaged.map(s => (
                <tr key={s.email} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4 text-gray-700 font-medium">{s.email}</td>
                  <td className="py-2 pr-4 text-right text-gray-600">{s.total}</td>
                  <td className="py-2 pr-4 text-right text-gray-600">{s.correct}</td>
                  <td className="py-2 text-right font-bold text-indigo-600">{s.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
