import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Zap, Loader2 } from 'lucide-react';

interface SuggestionResult {
  id: string;
  name: string;
  totalSkills: number;
  matched: string[];
  score: number;
}

interface Props {
  title: string;
  description: string;
  category: string;
  debounceMs?: number;
}

const ProfessionalSuggestions: React.FC<Props> = ({ title, description, category, debounceMs = 600 }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SuggestionResult[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title && !description) {
      setResults([]); setNeeded([]); return;
    }
    const handle = setTimeout(async () => {
      try {
        setLoading(true); setError(null);
        const resp = await axios.post('/api/issue-match-suggestions', { title, description, category });
        setResults(resp.data?.professionals || []);
        setNeeded(resp.data?.neededSkills || []);
  } catch {
        // Heuristic fallback when backend unavailable
        setError('Could not fetch professional matches');
        const fallbackText = `${title} ${description} ${category}`.toLowerCase();
        if (/street\s*light|streetlight|lamp|bulb|electric|wiring/.test(fallbackText)) {
          setNeeded(['electrical']);
          setResults([{
            id: 'heuristic-electrician',
            name: 'Recommended: Electrician',
            totalSkills: 1,
            matched: ['electrical'],
            score: 0.6
          }]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [title, description, category, debounceMs]);

  if (!title && !description) return null;

  return (
    <div className="mt-6 bg-white border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">Suggested Professionals</h3>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {needed.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {needed.map(skill => (
            <span key={skill} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
              <Zap className="w-3 h-3" /> {skill}
            </span>
          ))}
        </div>
      )}
      {(!loading && results.length === 0) && (
        <div className="text-xs text-gray-500">No direct professional matches yet. Continue typing more details.</div>
      )}
      <ul className="space-y-2">
        {results.map(r => (
          <li key={r.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">Matches: {r.matched.join(', ')}</div>
              </div>
              <div className="text-xs font-semibold text-blue-600">{Math.round(r.score * 100)}%</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfessionalSuggestions;