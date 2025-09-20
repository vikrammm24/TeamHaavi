import React from 'react';
import { useGamification } from '../contexts/gamification/useGamification';

type BadgeInfo = { name: string; points: number; description: string };
const BADGES: BadgeInfo[] = [
  { name: 'Bronze', points: 100, description: 'Kickoff contributor. Earned at 100 total points.' },
  { name: 'Silver', points: 300, description: 'Consistent helper. Earned at 300 total points.' },
  { name: 'Gold', points: 600, description: 'Community champion. Earned at 600 total points.' },
  { name: 'Platinum', points: 1000, description: 'CityConnect legend. Earned at 1000 total points.' },
];

const BadgeGallery: React.FC = () => {
  const { points } = useGamification();
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold mb-4">Badge Gallery</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BADGES.map((b) => {
          const earned = points >= b.points;
          const remaining = Math.max(0, b.points - points);
          const pct = Math.min(100, Math.round((points / b.points) * 100));
          return (
            <div
              key={b.name}
              className={`rounded-lg border p-4 ${earned ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}
              aria-label={`${b.name} badge card`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-gray-900">{b.name}</div>
                <div className={`text-[10px] uppercase tracking-wide ${earned ? 'text-green-700' : 'text-gray-500'}`}>{earned ? 'Earned' : 'Locked'}</div>
              </div>
              <div className="text-xs text-gray-600">Requires {b.points} pts</div>
              <p className="mt-2 text-xs text-gray-700 leading-snug">{b.description}</p>
              <div className="mt-3">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" aria-label={`${b.name} progress bar`}>
                  <div className={`${earned ? 'bg-green-500' : 'bg-blue-500'} h-2`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-gray-600">
                  {earned ? 'Completed' : `Progress: ${pct}%`}
                </div>
              </div>
              {!earned && (
                <div className="mt-1 text-xs text-gray-600">{remaining} more points to unlock</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGallery;
