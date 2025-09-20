import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchPolls, fetchTransport } from '../api/dataSources';

const ForCitizens: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [transport, setTransport] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const [i, p, t] = await Promise.all([
        fetchIssues(),
        fetchPolls(),
        fetchTransport(),
      ]);
      setIssues(i.slice(0, 3));
      setPolls(p.slice(0, 1));
      setTransport(t);
    })();
  }, []);

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold mb-2">For Citizens</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          Report local issues, track resolutions, vote in polls, and view transport updates for your area.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <Link to="/report-issue" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Report an Issue</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Raise potholes, streetlights, waste, water, and more with photos and location.</p>
        </Link>
        <Link to="/my-reports" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">My Reports</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Track your submitted issues and get notified on progress.</p>
        </Link>
        <Link to="/leaderboard" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Earn Badges</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Engage in your community and climb the leaderboard.</p>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Trending Near You</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {issues.map(it => (
            <div key={it.id} className="rounded-xl bg-white p-5 shadow-lg hover:shadow-xl transition">
              <div className="text-sm text-slate-500 mb-1">{it.location}</div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-slate-600 line-clamp-2">{it.description}</div>
              <div className="mt-2 text-xs text-slate-500">Status: {it.status}</div>
            </div>
          ))}
        </div>
      </section>

      {polls[0] && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Have your say</h2>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="font-semibold mb-2">{polls[0].question}</div>
            <div className="text-sm text-slate-600">Closes: {new Date(polls[0].closesAt).toLocaleString()}</div>
          </div>
        </section>
      )}

      {transport && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Transport quick glance</h2>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="font-medium">{transport.routes?.[0]?.name} — next arrivals: {(transport.routes?.[0]?.nextArrivals || []).join(', ')}</div>
            {transport.routes?.[0]?.suggestedAction && (
              <div className="text-sm text-slate-600">{transport.routes[0].suggestedAction}</div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default ForCitizens;
