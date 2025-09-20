import React, { useState, useEffect } from 'react';
import HospitalAmbulanceWidget from '../components/HospitalAmbulanceWidget';
import CarbonTrackerEcoBanner from '../components/CarbonTrackerEcoBanner';
import BulletinReliefVolunteering from '../components/BulletinReliefVolunteering';
import AccessibilityToggle from '../components/AccessibilityToggle';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, AlertTriangle, TrendingUp, Scan as ScanIcon, Route as RouteIcon } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
//
import { motion } from 'framer-motion';
import { fetchIssues, normalizeIssue } from '../api/dataSources';
import { rtdb, auth } from '../components/firebase/firebase.ts';
import { onValue, ref as dbRef, query as dbQuery, orderByChild, limitToLast } from 'firebase/database';
import ARReport from '../components/ui/ARReport';
import SafeRouteFinder from '../components/ui/SafeRouteFinder';

// ---- Domain Types ----
interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  location: string;
  createdAt: Date;
  lat?: number;
  lng?: number;
  _dist?: number;
  message?: string; // for activity reuse
}

// Removed unused domain interfaces to avoid lint errors

// Shape that normalizeIssue returns (assumed)
interface NormalizedIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  location: string;
  createdAt: Date | string | number;
  lat?: number;
  lng?: number;
}

const CitizenDashboard: React.FC = () => {
  // Minimal state only for used features
  const [, setMyReports] = useState<Issue[]>([]);

  const [showARReport, setShowARReport] = useState(false);
  const [showSafeRoute, setShowSafeRoute] = useState(false);
  const handleARReport = () => {
    setShowARReport(true);
    setShowSafeRoute(false);
  };
  const handleSafeRoute = () => {
    setShowSafeRoute(true);
    setShowARReport(false);
  };
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);

  const [animateCards, setAnimateCards] = useState(false);
  // Removed unused state setters to fix lint errors
  // Keep only one myReports declaration

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Stream user's reports from RTDB
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const q = dbQuery(dbRef(rtdb, `reports/${u.uid}`), orderByChild('timestamp'), limitToLast(50));
    const off = onValue(q, (snap) => {
      const raw = (snap.val() || {}) as Record<string, unknown>;
      const arr: Issue[] = Object.entries(raw).map(([id, vObj]) => {
        const v = (vObj as Record<string, unknown>);
        const timestamp = typeof v.timestamp === 'number' ? v.timestamp : Date.now();
        return {
          id,
          title: typeof v.title === 'string' ? v.title : 'Report',
          description: typeof v.description === 'string' ? v.description : '',
          status: typeof v.status === 'string' ? v.status : 'pending',
            priority: typeof v.priority === 'string' ? v.priority : 'medium',
          location: typeof v.location === 'string' ? v.location : 'Secunderabad',
          createdAt: new Date(timestamp),
        } as Issue;
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setMyReports(arr);
    });
    return () => off();
  }, []);

  // Recent issues from API near Secunderabad
  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Recent issues from API near Secunderabad
  useEffect(() => {
    let mounted = true;
    const pull = async () => {
      try {
        const arr = await fetchIssues();
        const norm = (Array.isArray(arr) ? arr : []).map(normalizeIssue) as NormalizedIssue[];
        const withDist = norm.map((i) => ({
          ...i,
        }));
        if (mounted) setIssues(withDist as Issue[]);
      } catch (err) {
        // handle error
      }
    };
    pull();
    return () => { mounted = false; };
  }, []);

  // --- Dashboard JSX ---
  // Add stats calculation if needed
  const stats = [
    {
      title: 'Total Issues',
      value: issues.length.toString(),
      change: '+0',
      trend: 'neutral' as 'neutral',
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      color: 'bg-yellow-100',
      onClick: () => navigate('/all-issues'),
    },
    {
      title: 'Resolved',
      value: issues.filter(i => i.status === 'resolved').length.toString(),
      change: '+0',
      trend: 'up' as 'up',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      color: 'bg-green-100',
      onClick: () => navigate('/my-reports?status=resolved'),
    },
    {
      title: 'In Progress',
      value: issues.filter(i => i.status === 'in-progress').length.toString(),
      change: '-0',
      trend: 'down' as 'down',
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-100',
      onClick: () => navigate('/my-reports?status=in-progress'),
    },
    {
      title: 'Trending',
      value: issues.filter(i => i.priority === 'high').length.toString(),
      change: '+0',
      trend: 'neutral' as 'neutral',
      icon: <TrendingUp className="w-6 h-6 text-red-500" />,
      color: 'bg-red-100',
      onClick: () => navigate('/my-reports?priority=high'),
    }
  ];

  // (no-op) — removed unused handlers

  return (
  <DashboardLayout title="Citizen Dashboard" sidebarType="citizen">
      <div>
        {/* Quick Action Feature Pages */}
        {showARReport && (
          <>
            <button
              onClick={() => setShowARReport(false)}
              className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
            >
              ← Back to Dashboard
            </button>
            <ARReport />
          </>
        )}
        {showSafeRoute && (
          <>
            <button
              onClick={() => setShowSafeRoute(false)}
              className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
            >
              ← Back to Dashboard
            </button>
            <SafeRouteFinder />
          </>
        )}
        {!showARReport && !showSafeRoute && (
          <>
            {/* Accessibility Toggle */}
            <AccessibilityToggle />
            {/* Hospital/Ambulance Widget */}
            <HospitalAmbulanceWidget />
            {/* Carbon Tracker & Eco Banners */}
            <CarbonTrackerEcoBanner />
            {/* Bulletin, Relief Locator & Volunteering */}
            <BulletinReliefVolunteering />
            {/* Header Section */}
            <header className="w-full bg-white shadow-sm rounded-xl mb-6 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-700">CityConnect</h1>
                <p className="text-gray-500">Welcome to your dashboard</p>
              </div>
              <div className="hidden md:block">
                <span className="font-medium text-blue-600">{new Date().toLocaleDateString()}</span>
              </div>
            </header>
            <div className="space-y-6">
              {/* New Feature Quick Actions */}
              <div className="flex gap-4 mb-6">
                <button onClick={handleARReport} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2">
                  <ScanIcon className="w-5 h-5" />
                  AR Civic Reporting
                </button>
                <button onClick={handleSafeRoute} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2">
                  <RouteIcon className="w-5 h-5" />
                  Safe Route Finder
                </button>
              </div>
              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white relative">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Report a New Issue</h2>
                    <p className="text-blue-100">Help improve your community by reporting issues</p>
                  </div>
                </div>
                {/* Movable Report Issue Button */}
                <button
                  onClick={() => navigate('/report-issue')}
                  className="absolute right-6 top-6 flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg z-50"
                  title="Report a New Issue"
                >
                  <Plus className="w-6 h-6" />
                  <span>Report Issue</span>
                </button>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StatCard {...stat} />
                  </motion.div>
                ))}
              </div>
              {/* Gamification moved to Leaderboard */}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;