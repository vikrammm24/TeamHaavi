import React, { useEffect, useState } from 'react';
import { MapPin, AlertCircle, Ambulance, Building2 } from 'lucide-react';

// Dummy data for demo; replace with API integration
const demoHospitals = [
  { id: 'h1', name: 'City Hospital', lat: 17.4399, lng: 78.4983, address: 'Main Road, Secunderabad', type: 'hospital' },
  { id: 'h2', name: 'Apollo Emergency', lat: 17.4412, lng: 78.4991, address: 'Apollo Lane', type: 'hospital' },
];
const demoAmbulances = [
  { id: 'a1', name: 'Ambulance #12', lat: 17.4405, lng: 78.4975, status: 'Available', type: 'ambulance' },
  { id: 'a2', name: 'Ambulance #7', lat: 17.4388, lng: 78.4962, status: 'On Duty', type: 'ambulance' },
];
const demoAlerts = [
  { id: 'al1', type: 'heatwave', message: 'Heatwave alert: Stay hydrated!', severity: 'high' },
  { id: 'al2', type: 'air', message: 'Air quality moderate today.', severity: 'medium' },
];

const HospitalAmbulanceWidget: React.FC = () => {
  const [hospitals, setHospitals] = useState(demoHospitals);
  const [ambulances, setAmbulances] = useState(demoAmbulances);
  const [alerts, setAlerts] = useState(demoAlerts);

  // Replace with real API fetches in production
  useEffect(() => {
    // Example: fetch hospitals, ambulances, alerts from backend
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
  <Building2 className="w-6 h-6 text-blue-600" />
        Nearest Hospitals & Ambulances
      </h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Real-Time Health Alerts
        </h3>
        <ul className="list-disc pl-5">
          {alerts.map(a => (
            <li key={a.id} className={`mb-1 text-${a.severity === 'high' ? 'red' : a.severity === 'medium' ? 'yellow' : 'gray'}-700`}>
              {a.message}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Hospitals
          </h3>
          <ul className="list-disc pl-5">
            {hospitals.map(h => (
              <li key={h.id} className="mb-1">
                <span className="font-medium">{h.name}</span> — {h.address}
                <span className="ml-2 text-gray-500"><MapPin className="inline w-4 h-4" /> {h.lat}, {h.lng}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-green-600" /> Ambulances
          </h3>
          <ul className="list-disc pl-5">
            {ambulances.map(a => (
              <li key={a.id} className="mb-1">
                <span className="font-medium">{a.name}</span> — {a.status}
                <span className="ml-2 text-gray-500"><MapPin className="inline w-4 h-4" /> {a.lat}, {a.lng}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HospitalAmbulanceWidget;
