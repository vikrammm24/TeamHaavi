import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/config';
import BadgeGallery from '../components/BadgeGallery';

interface LeaderEntry { id: string; user: string; points: number; badges: string[] }

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/gamification/leaderboard');
        if (mounted) setLeaders(res.data || []);
      } catch {
        setError('Failed to load leaderboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Leaderboard">
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Top Contributors</h2>
          {loading && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {!loading && !error && (
            <ol className="list-decimal pl-6 space-y-2">
              {leaders.map((l, idx) => (
                <li key={l.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{idx + 1}.</span>
                    <span className="font-medium text-gray-900">{l.user}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600 font-semibold">{l.points} pts</span>
                    <span className="text-gray-500 truncate max-w-xs">{l.badges.join(', ')}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Badge Gallery</h2>
          <BadgeGallery />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
