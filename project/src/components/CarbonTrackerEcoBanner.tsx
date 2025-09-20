import React, { useState } from 'react';
import { Leaf, Award } from 'lucide-react';

const demoCarbonSaved = 12.5; // kg CO2 saved this month
const demoEcoEvents = [
  { id: 'e1', title: 'Cleanup Drive: Lake Park', date: 'Sep 22', banner: 'Join the Lake Park Cleanup this Sunday!' },
  { id: 'e2', title: 'Eco Challenge: No Plastic Week', date: 'Sep 25-30', banner: 'Take the No Plastic Challenge and win eco badges!' },
];

const CarbonTrackerEcoBanner: React.FC = () => {
  const [carbonSaved] = useState(demoCarbonSaved);
  const [ecoEvents] = useState(demoEcoEvents);

  return (
    <div className="bg-green-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Leaf className="w-6 h-6 text-green-600" />
        Carbon Savings & Eco Challenges
      </h2>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-lg">
          <span className="font-semibold text-green-700">{carbonSaved} kg CO₂ saved</span>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="text-gray-600 text-sm">Based on your transport and eco actions this month.</div>
      </div>
      <div className="space-y-3">
        {ecoEvents.map(e => (
          <div key={e.id} className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
            <div className="font-semibold text-green-800">{e.title} <span className="text-xs text-gray-500">({e.date})</span></div>
            <div className="text-green-700">{e.banner}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarbonTrackerEcoBanner;
