import React, { useEffect, useState } from 'react';
import api from '../api/config';
import { fetchPolls, fetchSurveys, fetchConsultations, answerSurvey, addConsultationComment, flagConsultationComment, deleteConsultationComment } from '../api/dataSources';

type Poll = { id: string; question: string; closesAt: number; options: { id: string; text: string; votes: number }[] };
type Survey = { id: string; question: string; closesAt?: number; options: { id: string; text: string; count: number }[] };
type Consultation = { id: string; topic: string; description: string; comments: { id: string; name?: string; message: string; timestamp: number }[] };

function MiniDonut({ values, colors }: { values: number[]; colors: string[] }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const circ = 2 * Math.PI * 16; // r=16
  let offset = 0;
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" className="shrink-0">
      <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="6" />
      {values.map((v, i) => {
        const len = (v / total) * circ;
        const el = (
          <circle
            key={i}
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth="6"
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
      <circle cx="20" cy="20" r="10" fill="#fff" />
    </svg>
  );
}

const EngagementFeatures: React.FC<{ includePolls?: boolean }> = ({ includePolls = true }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls().then(setPolls);
    fetchSurveys().then(setSurveys);
    fetchConsultations().then(setConsultations);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Polls */}
      {includePolls && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Active Polls</h3>
          {polls.length === 0 ? (
            <div className="text-gray-500">No active polls.</div>
          ) : (
            polls.map((p) => {
              const total = p.options.reduce((acc, o) => acc + (o.votes || 0), 0);
              return (
              <div key={p.id} className="border rounded p-3 mb-3">
                <div className="flex items-start gap-3">
                  <MiniDonut values={p.options.map(o => o.votes || 0)} colors={["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"]} />
                  <div className="font-medium flex-1">{p.question}</div>
                </div>
                {p.closesAt && <div className="text-xs text-gray-500">Closes {new Date(p.closesAt).toLocaleString()}</div>}
                <div className="mt-2 space-y-2">
                  {p.options.map((o) => (
                    <button
                      key={o.id}
                      disabled={busy !== null}
                      onClick={async () => {
                        // Optimistic UI update
                        setPolls(prev => prev.map(pp => pp.id === p.id ? {
                          ...pp,
                          options: pp.options.map(oo => oo.id === o.id ? { ...oo, votes: oo.votes + 1 } : oo)
                        } : pp));
                        try {
                          setBusy(`${p.id}:${o.id}`);
                          await api.post(`/polls/${p.id}/vote`, { optionId: o.id });
                          const res = await api.get('/polls');
                          setPolls(res.data as Poll[]);
                        } catch {
                          // keep optimistic state
                        } finally { setBusy(null); }
                      }}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span>{o.text}</span>
                        <span className="text-xs text-gray-600">{o.votes} votes{total > 0 ? ` • ${Math.round((o.votes / total) * 100)}%` : ''}</span>
                      </div>
                      <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${total > 0 ? Math.round((o.votes / total) * 100) : 0}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              );
            })
          )}
        </div>
      )}

      {/* Surveys */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-2">Quick Surveys</h3>
        {surveys.length === 0 ? (
          <div className="text-gray-500">No active surveys.</div>
        ) : (
          surveys.map((s) => {
            const total = s.options.reduce((acc, o) => acc + (o.count || 0), 0);
            return (
            <div key={s.id} className="border rounded p-3 mb-3">
              <div className="flex items-start gap-3">
                <MiniDonut values={s.options.map(o => o.count || 0)} colors={["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6"]} />
                <div className="font-medium flex-1">{s.question}</div>
              </div>
              {s.closesAt && <div className="text-xs text-gray-500">Closes {new Date(s.closesAt).toLocaleString()}</div>}
              <div className="mt-2 space-y-2">
                {s.options.map((o) => (
                  <button
                    key={o.id}
                    disabled={busy !== null}
                    onClick={async () => {
                      // Optimistic
                      setSurveys(prev => prev.map(ss => ss.id === s.id ? {
                        ...ss,
                        options: ss.options.map(oo => oo.id === o.id ? { ...oo, count: oo.count + 1 } : oo)
                      } : ss));
                      try {
                        setBusy(`${s.id}:${o.id}`);
                        await answerSurvey(s.id, o.id);
                        const res = await fetchSurveys();
                        setSurveys(res as Survey[]);
                      } catch {
                        // keep optimistic state
                      } finally { setBusy(null); }
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span>{o.text}</span>
                      <span className="text-xs text-gray-600">{o.count} responses{total > 0 ? ` • ${Math.round((o.count / total) * 100)}%` : ''}</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                      <div className="h-2 bg-green-500 rounded" style={{ width: `${total > 0 ? Math.round((o.count / total) * 100) : 0}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Consultations */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-2">Public Consultations</h3>
        {consultations.length === 0 ? (
          <div className="text-gray-500">No open consultations.</div>
        ) : (
          consultations.map((c) => (
            <div key={c.id} className="border rounded p-3 mb-3">
              <div className="font-medium">{c.topic}</div>
              <div className="text-sm text-gray-600">{c.description}</div>
              <div className="mt-3">
                <div className="text-sm font-medium mb-1">Recent Comments</div>
                <CommentList
                  comments={c.comments}
                  onFlag={async (commentId) => {
                    // optimistic
                    setConsultations(prev => prev.map(cc => cc.id === c.id ? { ...cc, comments: cc.comments.map(cm => cm.id === commentId ? { ...cm, flagged: true } : cm) } : cc));
                    try { await flagConsultationComment(c.id, commentId); } catch {}
                  }}
                  onDelete={async (commentId) => {
                    // optimistic
                    setConsultations(prev => prev.map(cc => cc.id === c.id ? { ...cc, comments: cc.comments.filter(cm => cm.id !== commentId) } : cc));
                    try { await deleteConsultationComment(c.id, commentId, 'authority'); } catch {}
                  }}
                />
                <ConsultationForm
                  onSubmit={async (name, message) => {
                    // Optimistic append
                    const optimistic = { id: `tmp-${Date.now()}`, name: name || 'Anonymous', message, timestamp: Date.now() };
                    setConsultations(prev => prev.map(cc => cc.id === c.id ? { ...cc, comments: [optimistic, ...cc.comments] } : cc));
                    try {
                      setBusy(`comment:${c.id}`);
                      await addConsultationComment(c.id, name, message);
                      const res = await fetchConsultations();
                      setConsultations(res as Consultation[]);
                    } catch {
                      // keep optimistic state
                    } finally { setBusy(null); }
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ConsultationForm: React.FC<{ onSubmit: (name: string, message: string) => Promise<void> | void }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="mt-3 flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSubmitting(true);
        try { await onSubmit(name.trim(), message.trim()); setMessage(''); }
        finally { setSubmitting(false); }
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="border rounded px-3 py-2 text-sm"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Share your feedback..."
        className="border rounded px-3 py-2 text-sm"
        rows={3}
      />
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Comment'}
      </button>
    </form>
  );
};

export default EngagementFeatures;

const CommentList: React.FC<{
  comments: { id: string; name?: string; message: string; timestamp: number; flagged?: boolean }[];
  pageSize?: number;
  onFlag: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}> = ({ comments, pageSize = 5, onFlag, onDelete }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? comments : comments.slice(0, pageSize);
  return (
    <div>
      <ul className="space-y-2 max-h-60 overflow-auto pr-1">
        {visible.map(cm => (
          <li key={cm.id} className={`rounded p-2 ${cm.flagged ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">{cm.name || 'Citizen'} — {new Date(cm.timestamp).toLocaleString()}</div>
              <div className="flex gap-2 text-xs">
                {!cm.flagged && (
                  <button className="text-amber-600 hover:underline" onClick={() => onFlag(cm.id)}>Flag</button>
                )}
                <button className="text-red-600 hover:underline" onClick={() => onDelete(cm.id)}>Delete</button>
              </div>
            </div>
            <div className="mt-1 text-sm">{cm.message}</div>
            {cm.flagged && <div className="text-xs text-red-600 mt-1">Flagged for review</div>}
          </li>
        ))}
      </ul>
      {comments.length > pageSize && (
        <button className="mt-2 text-blue-600 hover:underline text-sm" onClick={() => setShowAll(s => !s)}>
          {showAll ? 'Show less' : `Show ${comments.length - pageSize} more`}
        </button>
      )}
    </div>
  );
};
