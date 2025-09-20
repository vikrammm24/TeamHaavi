import React, { useState } from 'react';
import { MapWithRealtimeLocation } from '../RealtimeLocation';

// Dummy safety data for demo
const demoRoutes = [
  {
    id: 'route1',
    name: 'Main Street to Civic Center',
    safety: 4.5,
    crowdDensity: 'Low',
    lighting: 'Good',
    cctv: 'Covered',
    notes: 'Safe, well-lit, monitored by CCTV.'
  },
  {
    id: 'route2',
    name: 'Park Lane to Market',
    safety: 2.8,
    crowdDensity: 'High',
    lighting: 'Poor',
    cctv: 'Partial',
    notes: 'Crowded, dim lighting, limited CCTV.'
  },
];

const SafeRouteFinder: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Safe Route Finder</h2>
      <p className="mb-4 text-gray-600">Find the safest route based on crowd density, lighting, and CCTV coverage.</p>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Route:</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={selectedRoute || ''}
          onChange={e => setSelectedRoute(e.target.value)}
        >
          <option value="">Choose a route</option>
          {demoRoutes.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      {selectedRoute && (
        <div className="bg-gray-50 rounded p-4 mb-4">
          {(() => {
            const route = demoRoutes.find(r => r.id === selectedRoute);
            if (!route) return null;
            return (
              <>
                <div className="font-semibold text-lg mb-2">{route.name}</div>
                <div className="mb-1">Safety Score: <span className="font-bold text-green-600">{route.safety}/5</span></div>
                <div className="mb-1">Crowd Density: {route.crowdDensity}</div>
                <div className="mb-1">Lighting: {route.lighting}</div>
                <div className="mb-1">CCTV: {route.cctv}</div>
                <div className="mb-1 text-gray-700">Notes: {route.notes}</div>
              </>
            );
          })()}
        </div>
      )}
      <div className="mb-4">
        <MapWithRealtimeLocation height={240} />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Navigate Safely</button>
    </div>
  );
};

export default SafeRouteFinder;
