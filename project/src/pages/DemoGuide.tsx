import React from 'react';

const DemoGuide: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Demo Guide</h1>
        <p className="text-slate-600 max-w-3xl mt-2">A short script to confidently present CityConnect.</p>
      </header>
      <ol className="list-decimal pl-6 space-y-2 text-slate-700">
        <li>Problem: fragmented city feedback; slow resolution.</li>
        <li>Solution: CityConnect — report issues, vote on priorities, consult on plans.</li>
        <li>Show: Report Issue, then see it appear on dashboards; discuss AI suggestions.</li>
        <li>Engage: Vote in a poll, answer a survey; watch charts update.</li>
        <li>Moderate: Flag/delete a harmful comment (with role guard).</li>
        <li>Impact: Visit the Impact page for metrics and community outcomes.</li>
        <li>Wrap: Gamification, accessibility, offline-ready PWA; invite questions.</li>
      </ol>
    </main>
  );
};

export default DemoGuide;
