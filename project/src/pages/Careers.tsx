import React from 'react';

const roles = [
  { title: 'Frontend Engineer (React/Tailwind)', location: 'Hyderabad / Remote', type: 'Full‑time', id: 'fe1' },
  { title: 'Mobile Engineer (React Native)', location: 'Hyderabad / Remote', type: 'Full‑time', id: 'me1' },
  { title: 'Backend Engineer (Node/Express)', location: 'Hyderabad / Remote', type: 'Full‑time', id: 'be1' },
];

const perks = [
  'Flexible remote‑first culture',
  'Learning budget and conferences',
  'ESOPs for early team members',
  'Health insurance & wellness stipend',
];

const Careers: React.FC = () => (
  <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
    <header>
      <h1 className="text-3xl font-bold mb-4">Careers</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Join us in building the future of cities.</p>
    </header>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Open Roles</h2>
      <div className="divide-y divide-slate-200">
        {roles.map(r => (
          <div key={r.id} className="py-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{r.title}</h3>
              <p className="text-sm text-slate-600">{r.location} • {r.type}</p>
            </div>
            <a
              href={`mailto:haavi@cityconnect.com?subject=${encodeURIComponent('Application: ' + r.title)}`}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >Apply</a>
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Perks & Benefits</h2>
      <ul className="grid md:grid-cols-2 gap-3 list-disc pl-5 text-slate-700">
        {perks.map((p, i) => (<li key={i}>{p}</li>))}
      </ul>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">How to apply</h2>
      <p className="text-slate-700">Email your resume, links (GitHub/portfolio), and a short note about why you want to work on city systems to haavi@cityconnect.com. Mention the role in the subject.</p>
    </section>
  </main>
);

export default Careers;
