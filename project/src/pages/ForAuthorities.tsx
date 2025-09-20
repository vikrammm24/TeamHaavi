import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAnalytics, fetchSensors, fetchBroadcast } from '../api/dataSources';

const ForAuthorities: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [broadcast, setBroadcast] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const [a, s, b] = await Promise.all([
        fetchAnalytics(),
        fetchSensors(),
        fetchBroadcast(),
      ]);
      setAnalytics(a);
      setSensors(s.slice(0, 3));
      setBroadcast(b);
    })();
  }, []);

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold mb-2">For Authorities</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Monitor city signals, analyze trends, and communicate proactively.</p>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <Link to="/authority-dashboard" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Authority Dashboard</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Real-time overview of issues, sensors and reports.</p>
        </Link>
        <Link to="/project-board" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Project Board</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Plan and execute city improvements.</p>
        </Link>
        <Link to="/messages" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Communicate</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Reach citizens and teams quickly.</p>
        </Link>
      </section>

      {analytics && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Forecast</h2>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="font-medium">Issues next week: {analytics.forecast?.issuesNextWeek ?? '—'}</div>
            <div className="text-sm text-slate-600">Severity: low {analytics.severity?.low ?? analytics.forecast?.severity?.low}, medium {analytics.severity?.medium ?? analytics.forecast?.severity?.medium}, high {analytics.severity?.high ?? analytics.forecast?.severity?.high}</div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4">Sensors</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {sensors.map(s => (
            <div key={s.id} className="rounded-xl bg-white p-5 shadow-lg">
              <div className="font-semibold">{s.type}</div>
              <div className="text-sm text-slate-600">{s.location} — {s.value}</div>
              <div className="text-xs text-slate-500">Status: {s.status}</div>
            </div>
          ))}
        </div>
      </section>

      {broadcast && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Active Broadcast</h2>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="font-medium">{broadcast.severity?.toUpperCase()}: {broadcast.message}</div>
            <div className="text-sm text-slate-600">Expires: {new Date(broadcast.expiresAt).toLocaleString()}</div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ForAuthorities;
