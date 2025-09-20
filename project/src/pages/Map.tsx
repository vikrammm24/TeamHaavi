import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Filter, Layers, Zoom, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface MapIssue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
  location: string;
  createdAt: Date;
}

const Map: React.FC = () => {
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'satellite' | 'street' | 'terrain'>('street');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading map data
    const loadMapData = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockIssues: MapIssue[] = [
          {
            id: '1',
            title: 'Pothole on Main Road',
            description: 'Large pothole causing traffic issues',
            status: 'pending',
            priority: 'high',
            lat: 17.4333,
            lng: 78.4167,
            location: 'Secunderabad Main Road',
            createdAt: new Date('2024-01-15')
          },
          {
            id: '2',
            title: 'Broken Street Light',
            description: 'Street light not working since last week',
            status: 'in-progress',
            priority: 'medium',
            lat: 17.4444,
            lng: 78.4278,
            location: 'Clock Tower Area',
            createdAt: new Date('2024-01-20')
          },
          {
            id: '3',
            title: 'Water Leakage',
            description: 'Water pipe burst near shopping complex',
            status: 'resolved',
            priority: 'high',
            lat: 17.4222,
            lng: 78.4056,
            location: 'Paradise Circle',
            createdAt: new Date('2024-01-10')
          }
        ];
        setIssues(mockIssues);
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  const filteredIssues = filter === 'all' ? issues : issues.filter(issue => issue.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      default:
        return 'border-green-500';
    }
  };

  const stats = [
    { label: 'Total Issues', value: issues.length, color: 'text-gray-600' },
    { label: 'Pending', value: issues.filter(i => i.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: 'text-blue-600' },
    { label: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: 'text-green-600' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Map View">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Map View">
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

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Map Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Issues</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                {/* View Mode */}
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'satellite' | 'street' | 'terrain')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="street">Street View</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Zoom In">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Zoom Out">
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" title="My Location">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mock Map Display */}
          <div className="relative h-96 md:h-[500px] bg-gray-100 overflow-hidden">
            {/* Background Map Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#000" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Issue Markers */}
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`absolute w-8 h-8 rounded-full border-2 ${getStatusColor(issue.status)} ${getPriorityColor(issue.priority)} cursor-pointer shadow-lg hover:scale-110 transition-transform`}
                style={{
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index * 20)}%`,
                }}
                onClick={() => setSelectedIssue(issue)}
                title={issue.title}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gray-700" />
                </div>
              </motion.div>
            ))}

            {/* Map Labels */}
            <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900">Secunderabad Area</h3>
              <p className="text-sm text-gray-600">Showing {filteredIssues.length} issues</p>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
              <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Resolved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Issue Details */}
          {selectedIssue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-gray-200 bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedIssue.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{selectedIssue.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{selectedIssue.location}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedIssue.status === 'resolved' 
                        ? 'bg-green-100 text-green-700'
                        : selectedIssue.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedIssue.status.replace('-', ' ')}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedIssue.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : selectedIssue.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedIssue.priority} priority
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Map;