import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listenGlobalNotifications } from '../components/firebase/notifications';
import { useNotifications } from '../contexts/NotificationContext';
import { BarChart, Users, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import ResourceOptimizerEquityIndex from '../components/ResourceOptimizerEquityIndex';
import DisasterReliefNGOIntegration from '../components/DisasterReliefNGOIntegration';
import GenderSafetyDashboard from '../components/GenderSafetyDashboard';
import DashboardLayout from '../components/DashboardLayout';
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import { MapWithRealtimeLocation } from '../components/RealtimeLocation';
import { useRealtimeReportPins, useRealtimeSOSPins } from '../hooks/useRealtimePins';
import { motion } from 'framer-motion';
import api from '../api/config';
import { fetchMatches, fetchAnalytics, fetchPayments, fetchSensors, fetchBroadcast, fetchPolls, fetchTransport, fetchLeaderboard, fetchIssues, normalizeIssue, SECUNDERABAD, haversineKm } from '../api/dataSources';
import EngagementFeatures from '../components/EngagementFeatures';

const AuthorityDashboard: React.FC = () => {
  const { addNotification } = useNotifications();
  const [animateCards, setAnimateCards] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [broadcast, setBroadcast] = useState<any | null>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [transport, setTransport] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [allIssues, setAllIssues] = useState<any[]>([]);

  useEffect(() => {
    setAnimateCards(true);
    const unsub = listenGlobalNotifications((notification) => {
      addNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
      });
    });
    return () => unsub();
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
  // Fetch emergency broadcast (auto-refresh)
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
  

  // Load issues (store all + derive recent near Secunderabad for table/map)
  useEffect(() => {
    let mounted = true;
    const pull = async () => {
      try {
        const arr = await fetchIssues();
        const norm = (Array.isArray(arr) ? arr : []).map(normalizeIssue);
        if (mounted) setAllIssues(norm);
        const withDist = norm.map((i: any) => ({ ...i, _dist: (i.lat && i.lng) ? haversineKm({ lat: i.lat, lng: i.lng }, SECUNDERABAD) : Infinity }));
        const chosen = withDist
          .filter(i => isFinite(i._dist) && i._dist <= 50)
          .sort((a,b) => a._dist - b._dist)
          .slice(0, 20);
        if (mounted) setRecentIssues(chosen);
      } catch {
        // Keep empty if API not available
      }
    };
    pull();
    const t = setInterval(pull, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const stats: Array<{ title: string; value: string; change: string; trend: 'up' | 'down' | 'neutral'; icon: React.ReactNode; color: string }> = [
    {
      title: 'Total Issues',
      value: '247',
      change: '+12',
      trend: 'up',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Resolved This Month',
      value: '189',
      change: '+23',
      trend: 'up',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Active Citizens',
      value: '1,234',
      change: '+45',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Avg Resolution Time',
      value: '3.2 days',
      change: '-0.5',
      trend: 'down',
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow'
    }
  ];

  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const reportPins = useRealtimeReportPins();
  const sosPins = useRealtimeSOSPins();

  // Derived data for Progress section
  const resolvedThisMonth = useMemo(() => {
    const now = Date.now();
    const startOfWindow = now - 30 * 24 * 3600 * 1000;
    return (allIssues || []).filter(i => i.status === 'resolved' && i.resolvedAt && new Date(i.resolvedAt).getTime() >= startOfWindow);
  }, [allIssues]);

  const resolvedAll = useMemo(() => (allIssues || []).filter(i => i.status === 'resolved' && i.resolvedAt && i.createdAt), [allIssues]);

  const avgResolutionMs = useMemo(() => {
    const durations = resolvedAll
      .map(i => new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime())
      .filter((d: any) => typeof d === 'number' && isFinite(d) && d > 0);
    if (!durations.length) return null as number | null;
    return Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length);
  }, [resolvedAll]);

  const formatDuration = (ms?: number | null) => {
    if (!ms || ms <= 0) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 48) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    return `${days}d ${remH}h`;
  };

  const loc = useLocation();
  useEffect(() => {
    try {
      const params = new URLSearchParams(loc.search);
      const section = params.get('section');
      if (section) {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch {}
  }, [loc.search]);

  return (
    <DashboardLayout title="Authority Dashboard" sidebarType="authority">
      <div className="space-y-6">
  {/* Resource Optimizer & Equity Index */}
  <ResourceOptimizerEquityIndex />
  {/* Disaster Relief & NGO Integration */}
  <DisasterReliefNGOIntegration />
  {/* Gender-Safety Dashboard */}
  <GenderSafetyDashboard />
        {/* Progress: single boxed container with four inline KPI cards */}
        <div id="progress" className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
            animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Progress</h2>
          </div>
          <div className="flex flex-nowrap gap-6 overflow-x-auto pb-1 -mx-1 px-1">
            {(Array.isArray(stats) ? stats : []).map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: animateCards ? 1 : 0, y: animateCards ? 0 : 20 }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[260px]"
              >
                {stat.title === 'Total Issues' ? (
                  <Link to="/all-issues" className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" aria-label="View all issues">
                    <StatCard {...stat} />
                  </Link>
                ) : (
                  <StatCard {...stat} />
                )}
                {/* Details under each KPI */}
                {stat.title === 'Total Issues' && (
                  <div className="mt-2 bg-white/70 border border-gray-200 rounded-lg p-3 shadow-sm max-h-40 overflow-auto text-sm">
                    <div className="font-medium text-gray-700 mb-1">Latest Issues</div>
                    <ul className="space-y-1">
                      {((allIssues && allIssues.length ? allIssues : recentIssues).slice(0, 5)).map((i:any) => (
                        <li key={i.id} className="flex items-start justify-between gap-2">
                          <span className="text-gray-800 line-clamp-1">{i.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                            i.status === 'resolved' ? 'bg-green-100 text-green-700' : i.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>{i.status}</span>
                        </li>
                      ))}
                      {((allIssues && allIssues.length ? allIssues : recentIssues).length === 0) && (
                        <li className="text-gray-500">No issues found.</li>
                      )}
                    </ul>
                  </div>
                )}
                {stat.title === 'Resolved This Month' && (
                  <div className="mt-2 bg-white/70 border border-gray-200 rounded-lg p-3 shadow-sm max-h-40 overflow-auto text-sm">
                    <div className="font-medium text-gray-700 mb-1">Resolved (last 30 days)</div>
                    <ul className="space-y-1">
                      {(resolvedThisMonth.slice(0, 5)).map((i:any) => (
                        <li key={i.id} className="flex items-start justify-between gap-2">
                          <span className="text-gray-800 line-clamp-1">{i.title}</span>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(i.resolvedAt).toLocaleDateString()}</span>
                        </li>
                      ))}
                      {resolvedThisMonth.length === 0 && (
                        <li className="text-gray-500">No resolved issues this month.</li>
                      )}
                    </ul>
                  </div>
                )}
                {stat.title === 'Active Citizens' && (
                  <div className="mt-2 bg-white/70 border border-gray-200 rounded-lg p-3 shadow-sm max-h-40 overflow-auto text-sm">
                    <div className="font-medium text-gray-700 mb-1">Top Participants</div>
                    <ul className="space-y-1">
                      {(Array.isArray(leaderboard) ? leaderboard : []).slice(0,5).map((u:any) => (
                        <li key={u.id} className="flex items-center justify-between gap-2">
                          <span className="text-gray-800 line-clamp-1">{u.user}</span>
                          <span className="text-xs text-purple-700 bg-purple-100 rounded-full px-2 py-0.5 whitespace-nowrap">{u.points} pts</span>
                        </li>
                      ))}
                      {(!leaderboard || leaderboard.length === 0) && (
                        <li className="text-gray-500">No active users yet.</li>
                      )}
                    </ul>
                  </div>
                )}
                {stat.title === 'Avg Resolution Time' && (
                  <div className="mt-2 bg-white/70 border border-gray-200 rounded-lg p-3 shadow-sm max-h-40 overflow-auto text-sm">
                    <div className="font-medium text-gray-700 mb-1">Average: <span className="text-gray-900">{formatDuration(avgResolutionMs)}</span></div>
                    <ul className="space-y-1">
                      {resolvedAll.slice(0,5).map((i:any) => {
                        const dur = new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime();
                        return (
                          <li key={i.id} className="flex items-start justify-between gap-2">
                            <span className="text-gray-800 line-clamp-1">{i.title}</span>
                            <span className="text-xs text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5 whitespace-nowrap">{formatDuration(dur)}</span>
                          </li>
                        );
                      })}
                      {resolvedAll.length === 0 && (
                        <li className="text-gray-500">No resolved issues to compute time.</li>
                      )}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
              animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '0.4s' }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Issues by Category
            </h3>
            <Chart type="doughnut" />
          </div>

          <div
            className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
              animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '0.5s' }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Resolution Trends</h3>
            <Chart type="line" />
          </div>
        </div>

        {/* Recent Issues */}
        <div
          id="recent-issues"
          className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
            animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.6s' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Issues</h3>
            <Link to="/all-issues" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300">
              View All Issues
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reported</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(recentIssues) && recentIssues.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-gray-500 text-center">No recent issues found. (API unavailable or no data)</td>
                  </tr>
                ) : (recentIssues || []).map((issue, index) => (
                  <tr
                    key={issue.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                      animateCards ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: `${(index + 7) * 0.1}s` }}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{issue.title}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {issue.location}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        issue.priority === 'high' ? 'bg-red-100 text-red-700' :
                        issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        issue.status === 'urgent' ? 'bg-red-100 text-red-700' :
                        issue.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{issue.reportedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        {/* Transport Optimization & Smart Ticketing */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Public Transport Optimization</h2>
          {transport ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Routes</h3>
                <ul className="list-disc pl-5 text-sm">
                  {transport.routes.map((r:any) => (
                    <li key={r.id} className="mb-1">
                      <span className="font-medium">{r.name}</span> — next: {r.nextArrivals.join(', ')} — occ: {r.occupancy}%
                      <div className="text-gray-600">Action: {r.suggestedAction}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Smart Ticketing</h3>
                <pre className="bg-gray-50 p-2 rounded text-xs text-gray-700">{JSON.stringify(transport.smartTicketing, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading transport data…</div>
          )}
        </section>

        {/* Blockchain Smart Contract Payments Section */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Blockchain Smart Contract Payments</h2>
          <p className="mb-2 text-gray-700">Recent blockchain payment transactions:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Tx Hash</th><th>Time</th></tr></thead>
              <tbody>{(Array.isArray(payments) ? payments : []).map(p => <tr key={p.id}><td>{p.from}</td><td>{p.to}</td><td>{p.amount}</td><td>{p.status}</td><td>{p.txHash}</td><td>{new Date(p.timestamp).toLocaleString()}</td></tr>)}</tbody>
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
              <tbody>{(Array.isArray(sensors) ? sensors : []).map(s => <tr key={s.id}><td>{s.type}</td><td>{s.value}</td><td>{s.location}</td><td>{s.status}</td><td>{new Date(s.timestamp).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        
        {/* Citizen Engagement: Polls + Leaderboard */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Citizen Engagement</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Active Polls</h3>
              {(Array.isArray(polls) && polls.length === 0) ? (
                <div className="text-gray-500">No active polls.</div>
              ) : (
                (Array.isArray(polls) ? polls : []).map((p:any) => (
                  <div key={p.id} className="border rounded p-3 mb-3">
                    <div className="font-medium">{p.question}</div>
                    <div className="text-xs text-gray-500">Closes {new Date(p.closesAt).toLocaleString()}</div>
                    <div className="mt-2 space-y-2">
                      {(Array.isArray(p.options) ? p.options : []).map((o:any) => (
                        <button key={o.id} onClick={async ()=>{
                          await api.post(`/polls/${p.id}/vote`, { optionId: o.id });
                          const res = await api.get('/polls');
                          setPolls(res.data);
                        }} className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border">
                          {o.text}  {o.votes} votes
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
                {(Array.isArray(leaderboard) ? leaderboard : []).map((u:any) => (
                  <li key={u.id} className="mb-1">
                    <span className="font-medium">{u.user}</span>  {u.points} pts <span className="text-gray-500">[{Array.isArray(u.badges) ? u.badges.join(', ') : ''}]</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Citizen Engagement Features */}
        <section className="my-8 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Citizen Engagement Features</h2>
          <EngagementFeatures includePolls={false} />
        </section>

        {/* Map Section */}
        <div
          className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
            animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.7s' }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Issue Locations
          </h3>
          <MapWithRealtimeLocation
            height={360}
            reportPins={reportPins as any}
            sosPins={sosPins as any}
            geojsonUrl="/geo/city-zones.geojson"
            showGeo={true}
            issues={
              (!reportPins.length && !sosPins.length
                ? (Array.isArray(recentIssues) ? recentIssues : [])
                    .filter(i => typeof i.lat === 'number' && typeof i.lng === 'number')
                    .map(i => ({ id: i.id, title: i.title, lat: i.lat, lng: i.lng }))
                : []
              ) as any
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuthorityDashboard;