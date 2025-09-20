import React from 'react';
import { ShieldCheck, AlertTriangle, Users } from 'lucide-react';

const safetyStats = [
  { zone: 'North', incidents: 2, safeSpots: 5, rating: 4.7 },
  { zone: 'East', incidents: 5, safeSpots: 3, rating: 4.2 },
  { zone: 'South', incidents: 1, safeSpots: 6, rating: 4.9 },
  { zone: 'West', incidents: 7, safeSpots: 2, rating: 3.8 },
];
const recentAlerts = [
  { id: 'a1', type: 'Harassment', zone: 'East', time: '2025-09-18 21:10', status: 'Resolved' },
  { id: 'a2', type: 'Unsafe Area', zone: 'West', time: '2025-09-19 08:30', status: 'Active' },
];

const GenderSafetyDashboard: React.FC = () => {
  return (
    <div className="bg-pink-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-pink-600" />
        Gender-Safety Analytics Dashboard
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> Safety Stats by Zone
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Zone</th><th>Incidents</th><th>Safe Spots</th><th>Safety Rating</th></tr></thead>
          <tbody>
            {safetyStats.map(s => (
              <tr key={s.zone}>
                <td>{s.zone}</td>
                <td>{s.incidents}</td>
                <td>{s.safeSpots}</td>
                <td><span className={`font-bold ${s.rating > 4.5 ? 'text-green-700' : s.rating > 4.0 ? 'text-yellow-700' : 'text-red-700'}`}>{s.rating}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" /> Recent Safety Alerts
        </h3>
        <table className="min-w-full text-sm">
          <thead><tr><th>Type</th><th>Zone</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            {recentAlerts.map(a => (
              <tr key={a.id}>
                <td>{a.type}</td>
                <td>{a.zone}</td>
                <td>{a.time}</td>
                <td><span className={`font-bold ${a.status === 'Active' ? 'text-red-700' : 'text-green-700'}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">Monitor and respond to gender-safety incidents in real time.</div>
      </div>
    </div>
  );
};

export default GenderSafetyDashboard;
