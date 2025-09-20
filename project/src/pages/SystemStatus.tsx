import React, { useEffect, useState } from 'react';
import { fetchSensors, fetchTransport } from '../api/dataSources';

const SystemStatus: React.FC = () => {
  const [sensors, setSensors] = useState<any[]>([]);
  const [transport, setTransport] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const [s, t] = await Promise.all([fetchSensors(), fetchTransport()]);
      setSensors(s.slice(0, 3));
      setTransport(t);
    })();
  }, []);

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">System Status</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">Live snapshot of key city signals.</p>
      </header>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="font-semibold mb-3">Sensors</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {sensors.map(s => (
              <li key={s.id}>{s.type}: {s.value} — {s.location} <span className="text-xs text-slate-500">[{s.status}]</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="font-semibold mb-3">Transport</h3>
          <div className="text-sm text-slate-700">
            {transport?.routes?.[0]?.name}: {(transport?.routes?.[0]?.nextArrivals || []).join(', ')}
          </div>
        </div>
      </section>
    </main>
  );
};

export default SystemStatus;
