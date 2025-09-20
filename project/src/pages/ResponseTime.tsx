import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Clock } from 'lucide-react';
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';

const ResponseTime: React.FC = () => {
  const [history, setHistory] = useState<Array<{ id: string; task: string; response: number; at?: number }>>([]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const ref = dbRef(rtdb, `responseTime/${u.uid}`);
    const off = onValue(ref, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([id, h]: any) => ({ id, task: h.task || 'Task', response: Number(h.response) || 0, at: h.at }));
      setHistory(arr);
    });
    return () => off();
  }, []);

  const avg = useMemo(() => {
    if (!history.length) return 0;
    const sum = history.reduce((s, h) => s + (h.response || 0), 0);
    return Math.round((sum / history.length) * 10) / 10;
  }, [history]);
  return (
  <DashboardLayout title="Response Time" sidebarType="professional">
      <div className="mb-4">
        <button onClick={() => window.location.hash ? (window.location.hash = '#/professional-dashboard') : (window.location.href = '/professional-dashboard')} className="px-3 py-1 border rounded">Back</button>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6 flex items-center gap-4">
          <Clock className="w-8 h-8 text-purple-600" />
          <div>
            <div className="text-2xl font-bold">{avg}h</div>
            <div className="text-gray-600 text-sm">Average Response Time</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Recent Responses</h3>
          <ul className="space-y-3">
            {(history.length ? history : [
              { id: 'mock-h1', task: 'Street Light Repair', response: 1.8, at: Date.now() - 2 * 60 * 60 * 1000 },
              { id: 'mock-h2', task: 'Pothole Repair', response: 2.6, at: Date.now() - 26 * 60 * 60 * 1000 },
            ]).map(h => (
              <li key={h.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{h.task}</div>
                  <div className="text-sm text-gray-600">{h.at ? new Date(h.at).toLocaleString() : ''}</div>
                </div>
                <div className="text-purple-700 font-semibold">{h.response}h</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
  </DashboardLayout>
  );
};

export default ResponseTime;
