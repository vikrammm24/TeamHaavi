import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, Clock, CheckCircle, DollarSign, MapPin, Calendar } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'in-progress' | 'completed' | 'cancelled';
  budget: number;
  location: string;
  deadline: Date;
  createdAt: Date;
  skills: string[];
  client: string;
  priority: 'low' | 'medium' | 'high';
}

const MyJobs: React.FC = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading jobs data
    const loadJobs = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Fix Street Light Issues',
            description: 'Repair and replace malfunctioning street lights in Secunderabad area',
            status: 'in-progress',
            budget: 15000,
            location: 'Secunderabad',
            deadline: new Date('2024-02-15'),
            createdAt: new Date('2024-01-15'),
            skills: ['Electrical', 'Maintenance'],
            client: 'Municipal Corporation',
            priority: 'high'
          },
          {
            id: '2',
            title: 'Road Pothole Repairs',
            description: 'Fill and repair potholes on main roads',
            status: 'available',
            budget: 25000,
            location: 'Hyderabad',
            deadline: new Date('2024-02-20'),
            createdAt: new Date('2024-01-20'),
            skills: ['Construction', 'Road Work'],
            client: 'City Development Authority',
            priority: 'medium'
          },
          {
            id: '3',
            title: 'Water Pipeline Maintenance',
            description: 'Inspect and maintain water supply lines',
            status: 'completed',
            budget: 18000,
            location: 'Begumpet',
            deadline: new Date('2024-01-25'),
            createdAt: new Date('2024-01-05'),
            skills: ['Plumbing', 'Pipeline'],
            client: 'Water Board',
            priority: 'high'
          },
          {
            id: '4',
            title: 'Park Maintenance',
            description: 'General maintenance and landscaping work for city park',
            status: 'available',
            budget: 12000,
            location: 'Paradise Circle',
            deadline: new Date('2024-03-01'),
            createdAt: new Date('2024-01-25'),
            skills: ['Landscaping', 'Maintenance'],
            client: 'Parks Department',
            priority: 'low'
          }
        ];
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Subscribe to applied jobs
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const myAppliedRef = dbRef(rtdb, `appliedJobs/${user.uid}`);
    const off = onValue(myAppliedRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]: any) => ({ id, ...(v || {}) }));
      setAppliedJobs(arr);
    });
    return () => off();
  }, []);

  useEffect(() => {
    // Initialize status filter from query param if present
    try {
      const params = new URLSearchParams(location.search);
      const s = params.get('status');
      if (s && ['available','in-progress','completed','cancelled','all'].includes(s)) {
        setStatusFilter(s);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'available':
        return <Briefcase className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'available':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const handleApplyJob = (jobId: string) => {
    // Handle job application logic
    console.log('Applied to job:', jobId);
    // Update job status or show confirmation
  };

  const stats = [
    { label: 'Total Jobs', value: jobs.length, color: 'text-gray-600' },
    { label: 'Available', value: jobs.filter(j => j.status === 'available').length, color: 'text-purple-600' },
    { label: 'In Progress', value: jobs.filter(j => j.status === 'in-progress').length, color: 'text-blue-600' },
    { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, color: 'text-green-600' },
  ];

  if (loading) {
    return (
  <DashboardLayout title="My Jobs" sidebarType="professional">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout title="My Jobs" sidebarType="professional">
      <div className="space-y-6">
        {/* Applied Jobs Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Applied Jobs ({appliedJobs.length})</h3>
          {appliedJobs.length === 0 ? (
            <div className="text-gray-500 text-sm">You haven't applied to any jobs yet.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {appliedJobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-3">
                  <span className="text-gray-800 truncate">
                    <a href={`#/job/${j.id}`} className="text-blue-600 hover:underline">{j.title}</a>
                  </span>
                  <span className="text-gray-500 whitespace-nowrap">Applied: {j.appliedAt ? new Date(j.appliedAt).toLocaleString() : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
                  placeholder="Search jobs..."
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
                <option value="available">Available</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Jobs ({filteredJobs.length})
            </h2>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{job.description}</p>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>₹{job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {job.deadline.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {job.status === 'available' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply for Job
                      </button>
                    </div>
                  )}

                  {job.status === 'in-progress' && (
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                        Mark Complete
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyJobs;