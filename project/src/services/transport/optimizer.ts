// Transport optimization stub returning mock dynamic public transport suggestions.

export interface RouteSuggestion {
  id: string;
  origin: string;
  destination: string;
  etaMinutes: number;
  mode: 'bus' | 'metro' | 'tram' | 'bike-share';
  congestionIndex: number; // 0-1 lower is better
  reliability: number; // 0-1
}

export async function getDynamicSuggestions(origin: string, destination: string): Promise<RouteSuggestion[]> {
  // Mock randomization based on string lengths to keep stable-ish per OD pair.
  const base = (origin.length + destination.length) % 7;
  const rand = () => (Math.sin(base + Date.now() / 60000) + 1) / 2; // pseudo changing value
  return [
    {
      id: 'r1',
      origin,
      destination,
      etaMinutes: 18 + Math.floor(rand() * 5),
      mode: 'bus',
      congestionIndex: 0.4 + rand() * 0.3,
      reliability: 0.7 + rand() * 0.2,
    },
    {
      id: 'r2',
      origin,
      destination,
      etaMinutes: 22 + Math.floor(rand() * 6),
      mode: 'metro',
      congestionIndex: 0.3 + rand() * 0.2,
      reliability: 0.85 + rand() * 0.1,
    },
    {
      id: 'r3',
      origin,
      destination,
      etaMinutes: 25 + Math.floor(rand() * 4),
      mode: 'bike-share',
      congestionIndex: 0.1 + rand() * 0.2,
      reliability: 0.6 + rand() * 0.25,
    },
  ];
}

export default { getDynamicSuggestions };
