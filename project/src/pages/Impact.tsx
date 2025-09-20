import React from 'react';

const Impact: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Social Impact & Relevance</h1>
        <p className="text-slate-600 max-w-3xl mt-2">Live metrics and outcomes driven by CityConnect participation.</p>
      </header>
      <section className="grid md:grid-cols-3 gap-4">
        {[{t:'Issues Resolved',v:'1,248',d:'+31 this week'},{t:'Citizen Votes',v:'9,432',d:'across 37 polls'},{t:'Consultation Feedback',v:'2,913',d:'moderated & summarized'}].map(c=> (
          <div key={c.t} className="bg-white rounded-lg border p-4">
            <div className="text-sm text-slate-600">{c.t}</div>
            <div className="text-2xl font-semibold">{c.v}</div>
            <div className="text-xs text-slate-500">{c.d}</div>
          </div>
        ))}
      </section>
      <section className="bg-white rounded-lg border p-4">
        <h2 className="text-xl font-semibold mb-2">Programs</h2>
        <ul className="list-disc pl-6 space-y-1 text-slate-700">
          <li>Road & Lighting improvement tracker with public polls</li>
          <li>Clean neighborhoods initiative with sensor & report fusion</li>
          <li>Inclusive consultations: multilingual, accessible participation</li>
        </ul>
      </section>
    </main>
  );
};

export default Impact;
