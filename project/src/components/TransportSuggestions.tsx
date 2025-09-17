import React from 'react';
import { useEffect, useState } from 'react';
import { fetchTransport } from '../api/dataSources';

interface TransportRoute { id: string; name: string; nextArrivals: string[]; occupancy: number; suggestedAction: string }
interface TransportData { routes: TransportRoute[] }

const TransportSuggestions: React.FC = () => {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const t = await fetchTransport();
        if (mounted) setData(t);
      } catch {
        setError('Failed to load transport suggestions');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (loading) return <div className="p-4 bg-white rounded shadow text-sm text-gray-500">Loading transport suggestions...</div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="p-6 bg-white rounded shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">Smart Transport Suggestions</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.routes.slice(0,6).map(r => (
          <div key={r.id} className="border rounded p-3 text-sm bg-gray-50">
            <div className="font-medium text-gray-800 mb-1">{r.name}</div>
            <div className="text-gray-600">Next: {r.nextArrivals.join(', ')}</div>
            <div className="text-gray-600">Occupancy: {r.occupancy}%</div>
            <div className="text-xs mt-1 text-blue-600">{r.suggestedAction}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportSuggestions;
