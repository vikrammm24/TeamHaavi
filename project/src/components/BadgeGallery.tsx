import React from 'react';
import { useGamification } from '../contexts/gamification/useGamification';

const ALL_BADGES = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const BadgeGallery: React.FC = () => {
  const { badge } = useGamification();
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold mb-4">Badge Gallery</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ALL_BADGES.map(b => {
          const earned = badge && ALL_BADGES.indexOf(b) <= ALL_BADGES.indexOf(badge);
          return (
            <div key={b} className={`rounded-lg border p-3 text-center ${earned ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
              <div className="text-sm font-medium">{b}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">{earned ? 'Earned' : 'Locked'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGallery;
