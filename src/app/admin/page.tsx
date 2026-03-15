'use client';

import { useState, useEffect, useCallback } from 'react';

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

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');

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

  useEffect(() => {
    if (authed) {
      fetchStats();
      fetchQuestions();
    }
  }, [authed, tab, fetchStats, fetchQuestions]);

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
      fetchQuestions();
      fetchStats();
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('Generating questions...');
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
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
      body: JSON.stringify({ secret: password }),
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
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
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
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Generate Questions
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

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {(['pending', 'approved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'pending' ? stats?.pendingReview || 0 : stats?.approvedQueue || 0})
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {tab === 'pending' && questions.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedIds.size === questions.length}
                onChange={toggleSelectAll}
                className="rounded"
              />
              Select all
            </label>
            {selectedIds.size > 0 && (
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
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-4">
          {questions.length === 0 && (
            <p className="text-center text-gray-500 py-12">No {tab} questions</p>
          )}
          {questions.map(q => (
            <div key={q.id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-start gap-3">
                {tab === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(q.id)}
                    onChange={() => toggleSelect(q.id)}
                    className="mt-1 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{q.specialty}</span>
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
                {tab === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
