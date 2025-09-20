import React from 'react';
import { Leaf, Award, Users } from 'lucide-react';

const ecoImpact = [
  { project: 'Park Cleanup', impact: 'Reduced litter by 80%', co2Saved: 120 },
  { project: 'Tree Plantation', impact: 'Planted 200 trees', co2Saved: 340 },
];
const diversityBadges = [
  { id: 'b1', name: 'Inclusive Leader', awardedTo: 'Priya S.' },
  { id: 'b2', name: 'Team Diversity Champion', awardedTo: 'Amit R.' },
];

const EcoImpactDiversityRecognition: React.FC = () => {
  return (
    <div className="bg-green-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Leaf className="w-6 h-6 text-green-600" />
        Eco-Impact Tracker & Diversity Recognition
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Eco-Impact Projects
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Project</th><th>Impact</th><th>CO₂ Saved (kg)</th></tr></thead>
          <tbody>
            {ecoImpact.map(e => (
              <tr key={e.project}>
                <td>{e.project}</td>
                <td>{e.impact}</td>
                <td>{e.co2Saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" /> Diversity Recognition Badges
        </h3>
        <table className="min-w-full text-sm">
          <thead><tr><th>Badge</th><th>Awarded To</th></tr></thead>
          <tbody>
            {diversityBadges.map(b => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.awardedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">Celebrate eco-impact and diversity achievements in your professional network.</div>
      </div>
    </div>
  );
};

export default EcoImpactDiversityRecognition;
