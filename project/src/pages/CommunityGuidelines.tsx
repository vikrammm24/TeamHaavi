import React from 'react';

const CommunityGuidelines: React.FC = () => (
  <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
    <header>
      <h1 className="text-3xl font-bold mb-4">Community Guidelines</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Help keep CityConnect respectful, safe, and useful for everyone.</p>
    </header>

    <section className="grid md:grid-cols-2 gap-6">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Do</h2>
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>Report issues with clear details and photos where possible.</li>
          <li>Use accurate locations to help authorities respond faster.</li>
          <li>Be respectful and constructive in messages and comments.</li>
          <li>Verify professional credentials before offering services.</li>
        </ul>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Don’t</h2>
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>Share others’ personal information without consent.</li>
          <li>Post misleading, fraudulent, or harmful content.</li>
          <li>Spam or abuse messaging channels.</li>
          <li>Interfere with emergency and SOS workflows.</li>
        </ul>
      </div>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Safety</h2>
      <p className="text-slate-700">For emergencies, use the SOS feature or contact local services immediately. Share your location only with trusted contacts. When meeting professionals in person, choose public, well‑lit places and verify identity.</p>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Report Misuse</h2>
      <p className="text-slate-700">If you notice misuse or content that violates these guidelines, report it via the issue page or email our team.</p>
      <div className="mt-3 flex gap-3">
        <a href="mailto:haavi@cityconnect.com" className="px-4 py-2 rounded bg-blue-600 text-white">Email Moderation</a>
        <a href="/report-issue" className="px-4 py-2 rounded border border-slate-300">Report an Issue</a>
      </div>
    </section>
  </main>
);

export default CommunityGuidelines;
