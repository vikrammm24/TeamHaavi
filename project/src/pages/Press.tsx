import React from 'react';

const Press: React.FC = () => (
  <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
    <header>
      <h1 className="text-3xl font-bold mb-4">Press</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Media resources, boilerplate, and contact.</p>
    </header>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Boilerplate</h2>
      <p className="text-slate-700">CityConnect is a platform that connects citizens, professionals, and authorities to resolve city issues faster. With live dashboards, transport insights, and community tools, we help cities respond to what matters.</p>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Assets</h2>
      <p className="text-slate-700">Logo files and screenshots are available on request.</p>
      <p className="mt-2 text-slate-700">Email <a className="underline" href="mailto:press@cityconnect.com">press@cityconnect.com</a> and we’ll share a press kit with icon PNGs and product images.</p>
    </section>

    <section className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Press Contact</h2>
      <p className="text-slate-700">Email: <a className="underline" href="mailto:press@cityconnect.com">press@cityconnect.com</a></p>
    </section>
  </main>
);

export default Press;
