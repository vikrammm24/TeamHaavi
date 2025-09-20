import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
  <section id={id} className="rounded-xl bg-white p-6 shadow-lg">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="text-slate-700 space-y-2">{children}</div>
  </section>
);

const PrivacyPolicy: React.FC = () => (
  <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
    <header>
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Your privacy matters. This policy explains what data we collect, how we use it, and your choices.</p>
    </header>

    <nav className="rounded-xl bg-white p-4 shadow-lg">
      <ul className="flex flex-wrap gap-4 text-sm">
        <li><a className="underline" href="#collection">Data we collect</a></li>
        <li><a className="underline" href="#usage">How we use data</a></li>
        <li><a className="underline" href="#security">Security</a></li>
        <li><a className="underline" href="#rights">Your rights</a></li>
        <li><a className="underline" href="#contact">Contact</a></li>
      </ul>
    </nav>

    <Section id="collection" title="Data we collect">
      <p>Account data (name, email), usage data (app actions, device), and optional location/media you share when reporting issues or using SOS.</p>
    </Section>

    <Section id="usage" title="How we use data">
      <ul className="list-disc pl-5">
        <li>Provide core features (issue reporting, dashboards, transport).</li>
        <li>Improve reliability and detect abuse.</li>
        <li>Send important updates and service messages.</li>
      </ul>
    </Section>

    <Section id="security" title="Security">
      <p>We use industry‑standard practices to protect data in transit and at rest. Access is limited to authorized personnel.</p>
    </Section>

    <Section id="rights" title="Your rights">
      <p>You can request access, correction, or deletion of your data. You may opt out of non‑essential communications.</p>
    </Section>

    <Section id="contact" title="Contact">
      <p>Questions? Email <a className="underline" href="mailto:privacy@cityconnect.com">privacy@cityconnect.com</a>.</p>
    </Section>
  </main>
);

export default PrivacyPolicy;
