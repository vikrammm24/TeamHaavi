import React, { useState } from 'react';
import { Megaphone, Heart, MapPin, Users } from 'lucide-react';

const demoBulletins = [
  { id: 'b1', message: 'Neighborhood meeting at Community Hall, Sep 23, 6pm.' },
  { id: 'b2', message: 'Water supply maintenance on Sep 24, expect outages.' },
];
const demoReliefCamps = [
  { id: 'r1', name: 'Relief Camp A', location: 'School Grounds', status: 'Open' },
  { id: 'r2', name: 'Relief Camp B', location: 'City Stadium', status: 'Full' },
];
const demoVolunteering = [
  { id: 'v1', title: 'Food Distribution', date: 'Sep 25', location: 'Camp A', slots: 5 },
  { id: 'v2', title: 'Medical Aid', date: 'Sep 26', location: 'Camp B', slots: 2 },
];

const BulletinReliefVolunteering: React.FC = () => {
  const [bulletins] = useState(demoBulletins);
  const [reliefCamps] = useState(demoReliefCamps);
  const [volunteering] = useState(demoVolunteering);

  return (
    <div className="bg-blue-50 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Megaphone className="w-6 h-6 text-blue-600" />
        Community Bulletin, Relief Locator & Volunteering
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" /> Bulletin Board
        </h3>
        <ul className="list-disc pl-5">
          {bulletins.map(b => (
            <li key={b.id} className="mb-1 text-blue-700">{b.message}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" /> Relief Camps
        </h3>
        <ul className="list-disc pl-5">
          {reliefCamps.map(r => (
            <li key={r.id} className={`mb-1 text-${r.status === 'Open' ? 'green' : 'red'}-700`}>
              <span className="font-medium">{r.name}</span> — {r.location} <span className="ml-2">({r.status})</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" /> Volunteering Opportunities
        </h3>
        <ul className="list-disc pl-5">
          {volunteering.map(v => (
            <li key={v.id} className="mb-1 text-pink-700">
              <span className="font-medium">{v.title}</span> — {v.date}, {v.location} <Users className="inline w-4 h-4 ml-2" /> Slots: {v.slots}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BulletinReliefVolunteering;
