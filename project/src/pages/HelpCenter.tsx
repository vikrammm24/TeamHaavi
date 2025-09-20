import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  { q: 'How do I report an issue?', a: 'Go to Report Issue, add title, description, location and photo for faster resolution.' },
  { q: 'How to track my reports?', a: 'Open My Reports page to see statuses like pending, in-progress, or resolved.' },
  { q: 'How does the voice SOS work?', a: 'Enable Voice SOS in the SOS widget. Say “help me” to trigger location share to your contacts.' },
  { q: 'How do I earn badges?', a: 'You earn points for reporting issues, voting in polls and engagement. Badges unlock at milestones on the Leaderboard.' },
];

const HelpCenter: React.FC = () => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => (
    faqs.filter(f => (f.q + f.a).toLowerCase().includes(query.toLowerCase()))
  ), [query]);

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold mb-3">Help Center</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Find answers, learn features, or reach our team.</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search help articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-1/2 rounded-lg px-4 py-2 border border-slate-200 bg-white shadow-sm"
          />
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <Link to="/report-issue" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Report an Issue</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Submit local problems with photos and precise location.</p>
        </Link>
        <Link to="/my-reports" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Track Your Reports</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Follow up on status changes and resolutions.</p>
        </Link>
        <Link to="/features" className="rounded-xl p-6 bg-white hover:shadow-xl transition shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Explore Features</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Learn about dashboards, transport, SOS, and more.</p>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
        <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-lg">
          {filtered.map((f, i) => (
            <details key={i} className="p-5">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-slate-600">{f.a}</p>
            </details>
          ))}
          {!filtered.length && (
            <div className="p-5 text-slate-500">No results. Try different keywords.</div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
        <p className="text-slate-600 mb-3">Contact our team and we’ll get back to you.</p>
        <div className="flex gap-4">
          <a href="mailto:haavi@cityconnect.com" className="px-4 py-2 rounded bg-blue-600 text-white">Email Support</a>
          <Link to="/contact" className="px-4 py-2 rounded border border-slate-300">Contact Page</Link>
        </div>
      </section>
    </main>
  );
};

export default HelpCenter;
