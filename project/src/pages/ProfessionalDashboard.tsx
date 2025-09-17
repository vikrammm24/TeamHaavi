import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, Star, MapPin, Calendar } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import api from '../api/config';
import { motion } from 'framer-motion';
import { fetchMatches, fetchAnalytics, fetchPayments, fetchSensors, fetchBroadcast, fetchTransport, fetchLeaderboard, fetchVerifications, fetchJobs, fetchMyJobs } from '../api/dataSources';

const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [animateCards, setAnimateCards] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [payments, setPayments] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [broadcast, setBroadcast] = useState<any | null>(null);
  const [transport, setTransport] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  useEffect(() => {
    setAiLoading(true);
    setAiError(null);
    Promise.all([
      fetchMatches('professional', ['carpentry', 'plumbing']),
      fetchAnalytics()
    ])
      .then(([matchRes, analyticsRes]) => {
        setAiMatches(matchRes.matches);
        setAiAnalytics(analyticsRes);
        setAiLoading(false);
      })
      .catch(() => {
        setAiError('Failed to fetch AI data');
        setAiLoading(false);
      });
  }, []);

  // Fetch payments
  useEffect(() => {
    fetchPayments().then(setPayments);
  }, []);
  // Fetch sensors (auto-refresh)
  useEffect(() => {
    const pull = () => fetchSensors().then(setSensors);
    pull();
    const interval = setInterval(pull, 5000);
    return () => clearInterval(interval);
  }, []);
  // Broadcast
  useEffect(() => {
    const pull = () => fetchBroadcast().then(setBroadcast);
    pull();
    const t = setInterval(pull, 15000);
    return () => clearInterval(t);
  }, []);
  // Transport
  useEffect(() => {
    fetchTransport().then(setTransport);
  }, []);
  // Leaderboard
  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard);
  }, []);
  // Fetch verifications
  useEffect(() => {
    fetchVerifications().then(setVerifications);
  }, []);
  const handleApprove = async (id) => {
    await api.patch(`/verifications/${id}`, { status: 'approved' });
    setVerifications(vs => vs.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  };

  const stats = [
    {
      title: 'Active Jobs',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Completed Jobs',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: <Star className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      title: 'Response Time',
      value: '2.1h',
      change: '-0.3',
      trend: 'down',
      icon: <Clock className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  const availableJobs = [
    {
      id: '1',
      title: 'Electrical Repair - Street Light',
      description: 'Replace faulty LED bulb in streetlight on Main Street',
      location: 'Main Street & 1st Ave',
      priority: 'medium',
      estimatedDuration: '2 hours',
      budget: '$150',
      postedAt: '30 min ago'
    },
    {
      id: '2',
      title: 'Pothole Repair',
      description: 'Fill and seal medium-sized pothole causing traffic issues',
      location: 'Oak Avenue & 3rd St',
      priority: 'high',
      estimatedDuration: '4 hours',
      budget: '$300',
      postedAt: '1 hour ago'
    },
    {
      id: '3',
      title: 'Graffiti Removal',
      description: 'Clean graffiti from bus stop walls and protective barriers',
      location: 'Bus Stop #47',
      priority: 'low',
      estimatedDuration: '1 hour',
      budget: '$80',
      postedAt: '2 hours ago'
    }
  ];

  const activeJobs = [
    {
      id: '1',
      title: 'Traffic Signal Maintenance',
      location: 'Downtown Intersection',
      progress: 75,
      deadline: 'Tomorrow 5:00 PM',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Park Bench Repair',
      location: 'Central Park',
      progress: 30,
      deadline: 'Friday 2:00 PM',
      status: 'in-progress'
    }
  ];

  return (
    <DashboardLayout title="Professional Dashboard">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Available Jobs</h2>
              <p className="text-green-100">Find and bid on city improvement projects</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => navigate('/project-board')}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                View Job Board
              </button>
            </div>
          </div>
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

        {/* Active Jobs */}
        <div
          className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
            animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.4s' }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Active Jobs</h3>
          
          <div className="space-y-4">
            {activeJobs.map((job, index) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{job.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {job.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-600">Progress: {job.progress}%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Broadcast Banner */}
        {broadcast && (
          <div className={`p-4 rounded border ${broadcast.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <strong>Emergency:</strong> {broadcast.message}
                <div className="text-xs opacity-75">Expires: {new Date(broadcast.expiresAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Available Jobs */}
        <div
          className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
            animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.5s' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Available Jobs</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300">
              View All Jobs
            </button>
          </div>

          <div className="grid gap-6">
            {availableJobs.map((job, index) => (
              <div
                key={job.id}
                className={`border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  animateCards ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${(index + 6) * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-lg">{job.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.priority === 'high' ? 'bg-red-100 text-red-700' :
                        job.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {job.priority} priority
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.estimatedDuration}
                      </span>
                      <span className="text-green-600 font-semibold">{job.budget}</span>
                      <span className="text-gray-500">Posted {job.postedAt}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:w-32">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                      Apply
                    </button>
                    <button className="text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-all duration-300">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Optimization & Smart Ticketing */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Public Transport Updates</h2>
          {transport ? (
            <ul className="list-disc pl-5 text-sm">
              {transport.routes.map((r:any) => (
                <li key={r.id} className="mb-1">
                  <span className="font-medium">{r.name}</span> — next: {r.nextArrivals.join(', ')} — occ: {r.occupancy}%
                  <div className="text-gray-600">Info: {r.suggestedAction}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">Loading transport data…</div>
          )}
        </section>

        {/* AI-powered Matching and Predictive Analytics Section */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">AI-powered Matching & Predictive Analytics</h2>
          <p className="mb-2 text-gray-700">This section displays recommended matches and analytics powered by AI.</p>
          {aiLoading ? (
            <div className="text-blue-500">Loading AI data...</div>
          ) : aiError ? (
            <div className="text-red-500">{aiError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Recommended Matches</h3>
                {aiMatches.length === 0 ? (
                  <div className="text-gray-400">No matches found.</div>
                ) : (
                  <ul className="list-disc pl-5">
                    {aiMatches.map((match: any) => (
                      <li key={match.id} className="mb-1">{match.name} ({match.needs ? match.needs.join(', ') : ''})</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Predictive Analytics</h3>
                {aiAnalytics ? (
                  <pre className="bg-gray-50 p-2 rounded text-xs text-gray-700">{JSON.stringify(aiAnalytics, null, 2)}</pre>
                ) : (
                  <div className="text-gray-400">No analytics data.</div>
                )}
              </div>
            </div>
          )}
        </section>
        {/* Blockchain Smart Contract Payments Section */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Blockchain Smart Contract Payments</h2>
          <p className="mb-2 text-gray-700">Recent blockchain payment transactions:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Tx Hash</th><th>Time</th></tr></thead>
              <tbody>{payments.map(p => <tr key={p.id}><td>{p.from}</td><td>{p.to}</td><td>{p.amount}</td><td>{p.status}</td><td>{p.txHash}</td><td>{new Date(p.timestamp).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        {/* Smart Sensors and CCTV Dashboard Section */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Smart Sensors & CCTV Dashboard</h2>
          <p className="mb-2 text-gray-700">Live sensor and CCTV data (auto-refreshes):</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th>Type</th><th>Value</th><th>Location</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>{sensors.map(s => <tr key={s.id}><td>{s.type}</td><td>{s.value}</td><td>{s.location}</td><td>{s.status}</td><td>{new Date(s.timestamp).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        {/* Professional Verification and Certification Section */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Professional Verification & Certification</h2>
          <p className="mb-2 text-gray-700">Pending professional verifications:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th>Name</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{verifications.map(v => <tr key={v.id}><td>{v.name}</td><td>{v.status}</td><td>{v.status === 'pending' && <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handleApprove(v.id)}>Approve</button>}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        {/* Citizen Engagement: Leaderboard */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Citizen Engagement</h2>
          <div>
            <h3 className="font-semibold mb-2">Leaderboard</h3>
            <ol className="list-decimal pl-5 text-sm">
              {leaderboard.map((u:any, idx:number) => (
                <li key={u.id} className="mb-1">
                  <span className="font-medium">{u.user}</span> — {u.points} pts <span className="text-gray-500">[{u.badges.join(', ')}]</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Citizen Engagement Features Section */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Citizen Engagement Features</h2>
          <p className="mb-2 text-gray-700">This section will host polls, surveys, and consultations for citizens.</p>
          <div className="border border-dashed border-gray-300 p-4 rounded text-center text-gray-400">[Polls, Surveys & Consultations UI Coming Soon]</div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ProfessionalDashboard;