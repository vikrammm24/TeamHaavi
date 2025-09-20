import React from 'react';
import { LifeBuoy, MapPin, Users, HeartHandshake } from 'lucide-react';

const reliefCamps = [
  { id: 'camp1', name: 'Central Relief Shelter', location: 'North Zone', capacity: 120, occupied: 85 },
  { id: 'camp2', name: 'Community Hall Shelter', location: 'East Zone', capacity: 80, occupied: 60 },
];
const ngos = [
  { id: 'ngo1', name: 'Helping Hands', volunteers: 40, focus: 'Food & Water' },
  { id: 'ngo2', name: 'Rescue Network', volunteers: 25, focus: 'Medical Aid' },
];
const activeDisasters = [
  { id: 'd1', type: 'Flood', zone: 'West', status: 'Active', aidNeeded: 'Food, Water, Medical' },
];

const DisasterReliefNGOIntegration: React.FC = () => {
  return (
    <div className="bg-red-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <LifeBuoy className="w-6 h-6 text-red-600" />
        Disaster Relief & NGO Integration
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" /> Relief Camps
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Occupied</th></tr></thead>
          <tbody>
            {reliefCamps.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.location}</td>
                <td>{c.capacity}</td>
                <td>{c.occupied}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-pink-600" /> NGO & Volunteer Integration
        </h3>
        <table className="min-w-full text-sm mb-4">
          <thead><tr><th>Name</th><th>Volunteers</th><th>Focus</th></tr></thead>
          <tbody>
            {ngos.map(n => (
              <tr key={n.id}>
                <td>{n.name}</td>
                <td>{n.volunteers}</td>
                <td>{n.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" /> Active Disasters
        </h3>
        <table className="min-w-full text-sm">
          <thead><tr><th>Type</th><th>Zone</th><th>Status</th><th>Aid Needed</th></tr></thead>
          <tbody>
            {activeDisasters.map(d => (
              <tr key={d.id}>
                <td>{d.type}</td>
                <td>{d.zone}</td>
                <td>{d.status}</td>
                <td>{d.aidNeeded}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">Coordinate with NGOs and volunteers for rapid disaster response.</div>
      </div>
    </div>
  );
};

export default DisasterReliefNGOIntegration;
