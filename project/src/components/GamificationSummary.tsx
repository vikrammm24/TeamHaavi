import React from 'react';
import { useGamification } from '../contexts/gamification/useGamification';

const GamificationSummary: React.FC = () => {
  const { points, level, badge, history } = useGamification();
  const recent = history.slice(0, 5);
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold mb-3">Gamification</h3>
      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <div className="text-2xl font-bold">{points}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Points</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{level}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Level</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{badge || '-'}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Badge</div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-medium text-sm mb-2">Recent Events</h4>
        {recent.length === 0 ? (
          <div className="text-gray-400 text-sm">No events yet.</div>
        ) : (
          <ul className="text-sm space-y-1 max-h-40 overflow-auto pr-1">
            {recent.map(e => (
              <li key={e.id} className="flex justify-between">
                <span className="capitalize">{e.event.toLowerCase().replace(/_/g,' ')}</span>
                <span className="text-blue-600 font-semibold">+{e.points}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GamificationSummary;
