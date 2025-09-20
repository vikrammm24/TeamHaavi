import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { MapPin, Calendar } from 'lucide-react';
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, onValue, set as dbSet } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useNotifications } from '../contexts/NotificationContext';
import { useGamification } from '../contexts/gamification/useGamification';

const ActiveJobs: React.FC = () => {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [myActive, setMyActive] = useState<any[]>([]);
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const { awardEvent } = useGamification();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid || null));
    return () => unsub();
  }, []);

  // My active (in-progress) jobs
  useEffect(() => {
    if (!uid) return;
    const ref = dbRef(rtdb, `appliedJobs/${uid}`);
    const off = onValue(ref, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([id, job]: any) => ({ id, ...(job || {}) }));
      setMyActive(arr.filter(j => j.status === 'in-progress'));
    });
    return () => off();
  }, [uid]);

  // Globally open jobs feed
  useEffect(() => {
    const ref = dbRef(rtdb, '/jobs');
    const off = onValue(ref, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([id, job]: any) => ({ id, ...(job || {}) }));
      setOpenJobs(arr.filter(j => !j.status || j.status === 'open'));
    });
    return () => off();
  }, []);

  const appliedIds = useMemo(() => new Set(myActive.map(j => j.id)), [myActive]);

  const dummyActive = [
    { id: 'd-elec-1', title: 'Street Light Circuit Repair', location: 'Sector 12 - Main Rd', progress: 60, estimatedDuration: '3 hours' },
    { id: 'd-plumb-1', title: 'Burst Pipe Containment', location: 'Ward 5 - Lakeview Colony', progress: 35, estimatedDuration: '5 hours' },
    { id: 'd-muni-1', title: 'Storm Drain Desilting', location: 'Old Market Underpass', progress: 20, estimatedDuration: '6 hours' },
  ];

  const handleApply = async (job: any) => {
    // Navigate to application form immediately for a snappy UX
    navigate(`/job/${job.id}/apply`, { state: { job } });
    // If not logged in, ProtectedRoute will redirect to login
    if (!uid) {
      addNotification?.({ type: 'warning', title: 'Login required', message: 'Please log in to complete your application.' });
      return;
    }
    try {
      const payload = {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        priority: job.priority,
        estimatedDuration: job.estimatedDuration,
        budget: job.budget,
        postedAt: job.postedAt,
        status: 'in-progress',
        appliedAt: Date.now(),
      };
      await dbSet(dbRef(rtdb, `appliedJobs/${uid}/${job.id}`), payload);
      addNotification?.({ type: 'success', title: 'Applied', message: `You applied to ${job.title}` });
    } catch (e: any) {
      addNotification?.({ type: 'error', title: 'Apply failed', message: String(e?.message || e) });
    }
  };

  const markComplete = async (jobId: string) => {
    if (!uid) return;
    try {
      await dbSet(dbRef(rtdb, `appliedJobs/${uid}/${jobId}/status`), 'completed');
      await dbSet(dbRef(rtdb, `appliedJobs/${uid}/${jobId}/completedAt`), Date.now());
      addNotification?.({ type: 'success', title: 'Completed', message: 'Job marked as completed.' });
      const award = awardEvent('JOB_COMPLETED', { jobId });
      if (award) {
        addNotification?.({ type: 'info', title: 'Great work!', message: `Job completion reward: +${award.pointsAwarded} pts.` });
        if (award.newBadge) {
          addNotification?.({ type: 'success', title: `New Badge: ${award.newBadge}`, message: `You earned the ${award.newBadge} badge.` });
        }
        if (award.newTotal % 100 === 0) {
          addNotification?.({ type: 'success', title: 'Level Up!', message: `You're now level ${award.newLevel}.` });
        }
      }
    } catch (e: any) {
      addNotification?.({ type: 'error', title: 'Update failed', message: String(e?.message || e) });
    }
  };

  return (
  <DashboardLayout title="My Jobs" sidebarType="professional">
      <div className="mb-4">
        <button onClick={() => navigate('/professional-dashboard')} className="px-3 py-1 border rounded">Back</button>
      </div>
      <div className="space-y-4">
        {(myActive.length ? myActive : dummyActive).map(job => (
          <div key={job.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">{job.title}</div>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                  {job.deadline && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Due: {job.deadline}</span>}
                </div>
              </div>
              <div className="text-right">
                {typeof job.progress === 'number' && <div className="text-sm text-gray-600">Progress: {job.progress}%</div>}
                <div className="w-40 bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${job.progress || 0}%` }} />
                </div>
                {'appliedAt' in job && (
                  <div className="mt-3">
                    <button onClick={() => markComplete(job.id)} className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700">Mark Complete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Open Jobs Now</h2>
        <div className="space-y-4">
          {(openJobs.length ? openJobs.filter(j => !appliedIds.has(j.id)) : [
            { id: 'o-elec-1', title: 'Faulty Pole Transformer Check', location: 'Ring Road Substation', estimatedDuration: '2 hours', priority: 'high' },
            { id: 'o-plumb-1', title: 'Sewer Line Jetting', location: 'Gandhi Nagar Lane 3', estimatedDuration: '4 hours', priority: 'medium' },
            { id: 'o-muni-1', title: 'Pothole Patchwork', location: 'Railway Station Approach', estimatedDuration: '3 hours', priority: 'low' },
          ]).map(job => (
            <div key={job.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{job.title}</div>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                    {job.estimatedDuration && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{job.estimatedDuration}</span>}
                  </div>
                </div>
                <button onClick={() => handleApply(job)} className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Apply</button>
              </div>
            </div>
          ))}
          {openJobs.filter(j => !appliedIds.has(j.id)).length === 0 && (
            <div className="text-sm text-gray-500">No more open jobs right now.</div>
          )}
        </div>
      </div>
  </DashboardLayout>
  );
};

export default ActiveJobs;
