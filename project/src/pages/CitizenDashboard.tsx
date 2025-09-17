import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import TransportSuggestions from '../components/TransportSuggestions';
import DashboardLayout from '../components/DashboardLayout';
import GamificationSummary from '../components/GamificationSummary';
import BadgeGallery from '../components/BadgeGallery';
import StatCard from '../components/StatCard';
import IssueCard from '../components/IssueCard';
import api from '../api/config';
import { motion } from 'framer-motion';
import { fetchMatches, fetchAnalytics, fetchPayments, fetchSensors, fetchBroadcast, fetchPolls, fetchTransport, fetchLeaderboard, fetchVerifications, fetchIssues, normalizeIssue, SECUNDERABAD, haversineKm } from '../api/dataSources';
import { rtdb, auth } from '../components/firebase/firebase.ts';
import { onValue, ref as dbRef, query as dbQuery, orderByChild, limitToLast } from 'firebase/database';

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

interface Match { id: string; name: string; skills?: string[] }
interface AnalyticsData { skillCounts?: Record<string, number>; needCounts?: Record<string, number> }
interface Payment { id: string; from: string; to: string; amount: number; status: string; txHash: string; timestamp: number }
interface Sensor { id: string; type: string; value: number; location: string; status: string; timestamp: number }
interface Verification { id: string; name: string; status: string }
interface PollOption { id: string; text: string; votes: number }
interface Poll { id: string; question: string; closesAt: number; options: PollOption[] }
interface TransportRoute { id: string; name: string; nextArrivals: string[]; occupancy: number; suggestedAction: string }
interface TransportData { routes: TransportRoute[] }
interface LeaderboardRow { id: string; user: string; points: number; badges: string[] }
interface Broadcast { message: string; severity: 'high' | 'medium' | 'low'; expiresAt: number }

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
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);

  const [animateCards, setAnimateCards] = useState(false);
  const [aiMatches, setAiMatches] = useState<Match[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<AnalyticsData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [transport, setTransport] = useState<TransportData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [myReports, setMyReports] = useState<Issue[]>([]);

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
    let mounted = true;
    const pull = async () => {
      try {
        const arr = await fetchIssues();
        const norm = (Array.isArray(arr) ? arr : []).map(normalizeIssue) as NormalizedIssue[];
        const withDist = norm.map((i) => ({
          ...i,
          createdAt: i.createdAt instanceof Date ? i.createdAt : new Date(i.createdAt || Date.now()),
          status: (['pending','in-progress','resolved'].includes(i.status) ? i.status : 'pending') as Issue['status'],
          priority: (['low','medium','high'].includes(i.priority) ? i.priority : 'medium') as Issue['priority'],
          _dist: (i.lat && i.lng) ? haversineKm({ lat: i.lat, lng: i.lng }, SECUNDERABAD) : Infinity
        }));
        const chosen = withDist
          .sort((a,b) => (a._dist ?? Infinity) - (b._dist ?? Infinity))
          .filter(i => (i._dist ?? Infinity) <= 50 || i._dist === Infinity)
          .slice(0, 5);
        if (mounted) setIssues(chosen);
      } catch {
        // leave empty if API not available; UI remains stable
      }
    };
    pull();
    const t = setInterval(pull, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    setAiLoading(true);
    setAiError(null);
    Promise.all([
      fetchMatches('citizen', ['plumbing', 'painting']),
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
  // Polls
  useEffect(() => {
    fetchPolls().then(setPolls);
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
  const handleApprove = async (id: string) => {
    await api.patch(`/verifications/${id}`, { status: 'approved' });
    setVerifications(vs => vs.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  };

  const stats: Array<{ title: string; value: string; change: string; trend: 'up' | 'down' | 'neutral'; icon: React.ReactNode; color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'; }> = [
    {
      title: 'Issues Reported',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Resolved Issues',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'In Progress',
      value: '3',
      change: '0',
      trend: 'neutral',
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      title: 'Community Score',
      value: '95',
      change: '+5',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  return (
    <DashboardLayout title="Citizen Dashboard">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Report a New Issue</h2>
              <p className="text-blue-100">Help improve your community by reporting issues</p>
            </div>
            <button
              onClick={() => navigate('/report-issue')}
              className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Report Issue
            </button>
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

        {/* Gamification Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GamificationSummary />
          </div>
          <div>
            <BadgeGallery />
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Your Recent Issues</h3>
            <button onClick={() => navigate('/my-reports')} className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {myReports.map((issue, index) => (
              <div
                key={issue.id}
                className={`transform transition-all duration-500 ${
                  animateCards ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${(index + 4) * 0.1}s` }}
              >
                <IssueCard issue={issue} />
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

        {/* Community Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Community Activity</h3>
          <div className="space-y-4">
            {
              // Fetch from API and filter near Secunderabad
              // For simplicity, reuse issues as activity if activity endpoint is empty
            }
            {issues.length === 0 ? (
              <div className="text-gray-500">No recent activity found.</div>
            ) : (
              issues.slice(0, 3).map((activity, index) => (
                <div
                  key={activity.id ?? index}
                  className={`flex items-start gap-4 p-4 bg-gray-50 rounded-lg transform transition-all duration-500 ${
                    animateCards ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                  style={{ transitionDelay: `${(index + 7) * 0.1}s` }}
                >
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.status === 'resolved' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-800">{activity.title || activity.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{activity.location || 'Secunderabad area'}</span>
                      <span>•</span>
                      <span>{new Date(activity.createdAt ?? Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transport Optimization & Smart Ticketing */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Public Transport Updates</h2>
          {transport ? (
            <ul className="list-disc pl-5 text-sm">
              {transport.routes.map((r) => (
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
  {/* Smart Transport Suggestions */}
  <TransportSuggestions />

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
                    {aiMatches.map((match) => (
                      <li key={match.id} className="mb-1">{match.name} ({match.skills ? match.skills.join(', ') : ''})</li>
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
        {/* Citizen Engagement: Polls + Leaderboard */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Citizen Engagement</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Active Polls</h3>
              {polls.length === 0 ? (
                <div className="text-gray-500">No active polls.</div>
              ) : (
                polls.map((p) => (
                  <div key={p.id} className="border rounded p-3 mb-3">
                    <div className="font-medium">{p.question}</div>
                    <div className="text-xs text-gray-500">Closes {new Date(p.closesAt).toLocaleString()}</div>
                    <div className="mt-2 space-y-2">
                      {p.options.map((o) => (
                        <button key={o.id} onClick={async ()=>{
                          await api.post(`/polls/${p.id}/vote`, { optionId: o.id });
                          const res = await api.get('/polls');
                          setPolls(res.data as Poll[]);
                        }} className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border">
                          {o.text} — {o.votes} votes
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Leaderboard</h3>
              <ol className="list-decimal pl-5 text-sm">
                {leaderboard.map((u) => (
                  <li key={u.id} className="mb-1"><span className="font-medium">{u.user}</span> — {u.points} pts <span className="text-gray-500">[{u.badges.join(', ')}]</span></li>
                ))}
              </ol>
            </div>
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

export default CitizenDashboard;