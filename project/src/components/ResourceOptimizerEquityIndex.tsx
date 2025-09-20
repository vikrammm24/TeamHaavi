import React from 'react';
import { BarChart, Users, Award } from 'lucide-react';

const demoResources = [
  { id: 'r1', type: 'Sanitation', allocated: 12, needed: 15, zone: 'North' },
  { id: 'r2', type: 'Water', allocated: 8, needed: 10, zone: 'East' },
  { id: 'r3', type: 'Medical', allocated: 5, needed: 5, zone: 'South' },
];
const demoEquityIndex = [
  { zone: 'North', index: 0.92 },
  { zone: 'East', index: 0.78 },
  { zone: 'South', index: 0.85 },
  { zone: 'West', index: 0.67 },
];

const ResourceOptimizerEquityIndex: React.FC = () => {
  return (
    <div className="bg-purple-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BarChart className="w-6 h-6 text-purple-600" />
        Resource Optimizer & Equity Index
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Resource Allocation
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Type</th><th>Allocated</th><th>Needed</th><th>Zone</th></tr></thead>
          <tbody>
            {demoResources.map(r => (
              <tr key={r.id}>
                <td>{r.type}</td>
                <td>{r.allocated}</td>
                <td>{r.needed}</td>
                <td>{r.zone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" /> Equity Index
        </h3>
        <table className="min-w-full text-sm">
          <thead><tr><th>Zone</th><th>Equity Index</th></tr></thead>
          <tbody>
            {demoEquityIndex.map(e => (
              <tr key={e.zone}>
                <td>{e.zone}</td>
                <td><span className={`font-bold ${e.index > 0.8 ? 'text-green-700' : e.index > 0.7 ? 'text-yellow-700' : 'text-red-700'}`}>{(e.index * 100).toFixed(0)}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">Higher index means more equitable service delivery.</div>
      </div>
    </div>
  );
};

export default ResourceOptimizerEquityIndex;
