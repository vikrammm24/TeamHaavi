import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMatches, fetchVerifications } from '../api/dataSources';

const ForProfessionals: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const v = await fetchVerifications();
      setVerifications(v.slice(0, 3));
      const m = await fetchMatches('professional', ['plumbing', 'electrical']);
      setMatches(m.matches?.slice(0, 3) || []);
    })();
  }, []);

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold mb-2">For Professionals</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Verification status, citizen matches and quick actions to collaborate.</p>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <Link to="/project-board" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Project Board</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Plan, assign and track your civic projects.</p>
        </Link>
        <Link to="/messages" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Messages</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Coordinate with citizens and teams.</p>
        </Link>
        <Link to="/report-issue" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Log Field Finding</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Capture on-ground issues with photos and location.</p>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Verification</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {verifications.map(v => (
            <div key={v.id} className="rounded-xl bg-white p-5 shadow-lg">
              <div className="font-semibold">{v.name}</div>
              <div className="text-sm text-slate-600">Status: {v.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Potential Matches</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {matches.map((m: any, idx: number) => (
            <div key={idx} className="rounded-xl bg-white p-5 shadow-lg">
              <div className="font-semibold">{m.name || m.user}</div>
              <div className="text-sm text-slate-600">Needs: {(m.needs || []).join(', ') || '—'}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ForProfessionals;
