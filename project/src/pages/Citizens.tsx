import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MapPin, Phone, Mail, Award, MessageSquare } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface Citizen {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  joinedAt: Date;
  reportsCount: number;
  resolvedCount: number;
  points: number;
  badges: string[];
  status: 'active' | 'inactive';
}

const Citizens: React.FC = () => {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [filteredCitizens, setFilteredCitizens] = useState<Citizen[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy data for now (replace with RTDB later)
    const mockCitizens: Citizen[] = [
      {
        id: 'u1',
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '+91 90000 11111',
        location: 'Secunderabad',
        joinedAt: new Date('2024-01-10'),
        reportsCount: 14,
        resolvedCount: 9,
        points: 1280,
        badges: ['Helper', 'Reporter'],
        status: 'active',
      },
      {
        id: 'u2',
        name: 'Priya Iyer',
        email: 'priya.iyer@example.com',
        phone: '+91 95555 22222',
        location: 'Hyderabad',
        joinedAt: new Date('2024-02-05'),
        reportsCount: 8,
        resolvedCount: 6,
        points: 980,
        badges: ['Responder'],
        status: 'active',
      },
      {
        id: 'u3',
        name: 'John Smith',
        email: 'john.smith@example.com',
        location: 'Begumpet',
        joinedAt: new Date('2024-03-12'),
        reportsCount: 3,
        resolvedCount: 1,
        points: 250,
        badges: ['Newcomer'],
        status: 'inactive',
      },
      {
        id: 'u4',
        name: 'Ananya Rao',
        email: 'ananya.rao@example.com',
        phone: '+91 93333 55555',
        location: 'Paradise Circle',
        joinedAt: new Date('2024-04-21'),
        reportsCount: 5,
        resolvedCount: 4,
        points: 640,
        badges: ['Verified'],
        status: 'active',
      },
    ];
    setCitizens(mockCitizens);
    setFilteredCitizens(mockCitizens);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = citizens;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(citizen =>
        citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citizen.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citizen.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(citizen => citizen.status === statusFilter);
    }

    setFilteredCitizens(filtered);
  }, [citizens, searchTerm, statusFilter]);

  const stats = [
    { label: 'Total Citizens', value: citizens.length, color: 'text-blue-600' },
    { label: 'Active', value: citizens.filter(c => c.status === 'active').length, color: 'text-green-600' },
    { label: 'Inactive', value: citizens.filter(c => c.status === 'inactive').length, color: 'text-gray-600' },
    { label: 'Total Reports', value: citizens.reduce((sum, c) => sum + c.reportsCount, 0), color: 'text-purple-600' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Citizens">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout title="Citizens" sidebarType="authority">
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
                  placeholder="Search citizens..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Citizens List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Citizens ({filteredCitizens.length})
            </h2>
          </div>

          {filteredCitizens.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No citizens found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCitizens.map((citizen, index) => (
                <motion.div
                  key={citizen.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{citizen.name}</h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            citizen.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {citizen.status}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{citizen.email}</span>
                          </div>
                          {citizen.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{citizen.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{citizen.location}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Reports:</span>
                            <span className="ml-2 font-medium">{citizen.reportsCount}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Resolved:</span>
                            <span className="ml-2 font-medium text-green-600">{citizen.resolvedCount}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Points:</span>
                            <span className="ml-2 font-medium text-blue-600">{citizen.points}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      {citizen.badges.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Badges:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {citizen.badges.map((badge, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Citizens;