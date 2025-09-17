import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import IssueCard from '../components/IssueCard';
import api from '../api/config';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMyIssues, normalizeIssue, SECUNDERABAD, haversineKm } from '../api/dataSources';

export type Issue = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  location: string;
  createdAt: Date;
  assignedTo?: string;
  estimatedCompletion?: Date;
  resolvedAt?: Date;
};

function toDate(x: any): Date | undefined {
  if (!x) return undefined;
  const d = new Date(x);
  return isNaN(d.getTime()) ? undefined : d;
}

function normalizeIssues(raw: any[]): Issue[] {
  return (raw || []).map((r: any) => ({
    id: String(r.id ?? r._id ?? Math.random().toString(36).slice(2)),
    title: String(r.title ?? 'Untitled Issue'),
    description: String(r.description ?? ''),
    status: (r.status === 'in-progress' || r.status === 'resolved' || r.status === 'pending') ? r.status : 'pending',
    priority: (r.priority === 'low' || r.priority === 'medium' || r.priority === 'high') ? r.priority : 'medium',
    location: String(r.location ?? r.address ?? 'Unknown'),
    createdAt: toDate(r.createdAt) || new Date(),
    assignedTo: r.assignedTo ? String(r.assignedTo) : undefined,
    estimatedCompletion: toDate(r.estimatedCompletion),
    resolvedAt: toDate(r.resolvedAt),
  }));
}

const sampleIssues: Issue[] = [
  {
    id: 's1',
    title: 'Broken Streetlight',
    description: 'Streetlight on Main St flickers at night',
    status: 'in-progress',
    priority: 'medium',
    location: 'Main Street & 1st Ave',
    createdAt: new Date(Date.now() - 86400000),
    assignedTo: 'Electric Works Co.',
    estimatedCompletion: new Date(Date.now() + 172800000),
  },
  {
    id: 's2',
    title: 'Pothole on Oak Avenue',
    description: 'Large pothole causing traffic issues',
    status: 'resolved',
    priority: 'high',
    location: 'Oak Avenue & 3rd St',
    createdAt: new Date(Date.now() - 259200000),
    resolvedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 's3',
    title: 'Graffiti at Bus Stop',
    description: 'Graffiti on bus stop needs cleaning',
    status: 'pending',
    priority: 'low',
    location: 'Bus Stop #47',
    createdAt: new Date(Date.now() - 43200000),
  },
];

const MyReports: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    let mounted = true;
    const pull = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyIssues();
        const norm = (Array.isArray(data) ? data : []).map(normalizeIssue);
        // Prefer issues near Secunderabad when coordinates exist
        const withDistance = norm.map((i: any) => ({ ...i, _dist: (i.lat && i.lng) ? haversineKm({ lat: i.lat, lng: i.lng }, SECUNDERABAD) : Infinity }));
        const sorted = withDistance.sort((a,b) => (a._dist - b._dist));
        const chosen = sorted.filter(i => i._dist <= 50 || i._dist === Infinity); // within 50km or unknown
        if (mounted) setIssues(normalizeIssues(chosen));
      } catch (e) {
        if (mounted) {
          setIssues(sampleIssues);
          setError('Could not load your reports from the server. Showing sample data.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    pull();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return issues;
    return issues.filter(i => i.status === statusFilter);
  }, [issues, statusFilter]);

  return (
    <DashboardLayout title="My Reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/report-issue')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> New Report
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading your reports…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">{error}</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-gray-500">No reports found for selected filter.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyReports;
