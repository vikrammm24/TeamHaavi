import React, { useEffect, useState } from 'react';
import { fetchIssues } from '../api/dataSources';

const About: React.FC = () => {
  const [issueCount, setIssueCount] = useState<number | null>(null);
  useEffect(() => {
    let mounted = true;
    fetchIssues().then(arr => { if (mounted) setIssueCount(arr?.length ?? 0); });
    return () => { mounted = false; };
  }, []);

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">CityConnect builds smarter cities through technology and collaboration.</p>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Cities Served</h3>
          <p className="text-3xl font-bold mt-1">12+</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Issues Resolved</h3>
          <p className="text-3xl font-bold mt-1">3,500+</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Active Reports</h3>
          <p className="text-3xl font-bold mt-1">{issueCount ?? '—'}</p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
        <p className="text-slate-700">We connect citizens, professionals, and authorities to make cities responsive and resilient. From reporting potholes to managing public transport and sensors, we turn community input into action.</p>
      </section>
    </main>
  );
};

export default About;
