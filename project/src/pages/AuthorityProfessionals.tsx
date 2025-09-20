import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchVerifications } from '../api/dataSources';
import api from '../api/config';

const AuthorityProfessionals: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchVerifications();
      setVerifications(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/verifications/${id}`, { status: 'approved' });
      setVerifications(vs => vs.map(v => v.id === id ? { ...v, status: 'approved' } : v));
    } catch (e) {
      // keep silent; page remains usable with sample data
    }
  };

  const pending = verifications.filter(v => v.status === 'pending');
  const approved = verifications.filter(v => v.status === 'approved');

  return (
    <DashboardLayout title="Professionals" sidebarType="authority">
      <div className="space-y-8">
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Verifications</h2>
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : pending.length === 0 ? (
            <div className="text-gray-500">No pending requests.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(v => (
                    <tr key={v.id} className="border-b">
                      <td className="py-2 px-3">{v.name}</td>
                      <td className="py-2 px-3">{v.status}</td>
                      <td className="py-2 px-3">
                        <button
                          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleApprove(v.id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Approved Professionals</h2>
          {approved.length === 0 ? (
            <div className="text-gray-500">None approved yet.</div>
          ) : (
            <ul className="divide-y">
              {approved.map(v => (
                <li key={v.id} className="py-2 flex items-center justify-between">
                  <span className="text-gray-800">{v.name}</span>
                  <span className="text-green-700 bg-green-100 text-xs px-2 py-1 rounded-full">approved</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AuthorityProfessionals;
