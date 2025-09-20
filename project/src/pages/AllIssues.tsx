import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import IssueCard from '../components/IssueCard';
import { fetchIssues, normalizeIssue } from '../api/dataSources';
import { rtdb } from '../components/firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';

interface Issue {
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
}

const AllIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    const loadIssues = async () => {
      try {
        setLoading(true);
        // Initial load from API/local as fallback
        const data = await fetchIssues();
        const normalized = (Array.isArray(data) ? data : []).map(normalizeIssue) as Issue[];
        setIssues(normalized);
      } catch (error) {
        console.error('Error loading issues:', error);
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
    // Live subscription to publicReports in RTDB
    const prRef = dbRef(rtdb, 'publicReports');
    const off = onValue(prRef, (snap) => {
      const val = snap.val() || {};
      const arr: Issue[] = Object.entries(val).map(([id, v]: any) => normalizeIssue({ id, createdAt: v?.timestamp, ...v })) as Issue[];
      // Merge with existing (avoid duplicates by id)
      setIssues((prev) => {
        const map = new Map<string, Issue>();
        [...prev, ...arr].forEach((i) => map.set(i.id, i));
        return Array.from(map.values());
      });
    });
    unsub = () => off();
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    let filtered = issues;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, priorityFilter]);

  // kept for future row badges if needed

  const stats = [
    { label: 'Total Issues', value: issues.length, color: 'text-gray-600' },
    { label: 'Pending', value: issues.filter(i => i.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: 'text-blue-600' },
    { label: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: 'text-green-600' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="All Issues">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="All Issues">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-0 md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="min-w-0 md:w-48">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Issues ({filteredIssues.length})
            </h2>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <IssueCard issue={issue} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllIssues;