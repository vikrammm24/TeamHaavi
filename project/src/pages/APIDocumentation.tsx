import React from 'react';

const APIDocumentation: React.FC = () => (
  <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-6">
    <header>
      <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Simple JSON endpoints for matches, issues, sensors, payments, and more.</p>
    </header>

    <section>
      <h2 className="text-xl font-semibold mb-2">Base URL</h2>
      <pre className="bg-slate-900 text-slate-100 p-3 rounded">/api</pre>
    </section>

    <section>
      <h2 className="text-xl font-semibold mb-2">Endpoints</h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
        <li>POST <code>/match</code> — AI-style citizen/professional matching</li>
        <li>GET <code>/analytics</code> — simple forecasts and counts</li>
        <li>GET <code>/issues</code>, POST <code>/issues</code> — civic issues</li>
        <li>POST <code>/issue-match-suggestions</code> — skills suggestions per issue</li>
        <li>GET/POST <code>/payments</code> — blockchain-like payment records</li>
        <li>GET/POST <code>/sensors</code> — IoT sensors (air, traffic, noise)</li>
        <li>GET/PATCH/POST <code>/verifications</code> — professional verifications</li>
        <li>GET <code>/transport</code> — routes, arrivals, occupancy</li>
        <li>GET <code>/polls</code>, POST <code>/polls/:pollId/vote</code> — community polls & voting</li>
        <li>GET <code>/surveys</code>, POST <code>/surveys/:surveyId/answer</code> — quick surveys</li>
  <li>GET <code>/consultations</code>, POST <code>/consultations/:id/comments</code> — public consultations</li>
  <li>DELETE <code>/consultations/:id/comments/:commentId</code> — delete comment (requires header <code>x-role: authority</code> or <code>professional</code>)</li>
        <li>POST <code>/assistant</code> — multilingual assistant replies</li>
        <li>POST <code>/vision/classify</code> — image labels (mock)</li>
      </ul>
    </section>
  </main>
);

export default APIDocumentation;
