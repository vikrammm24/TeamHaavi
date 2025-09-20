import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, MapPin } from 'lucide-react';
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const CompletedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const dummyCompleted = [
    { id: 'c-elec-1', title: 'LED Streetlight Retrofit', location: 'Airport Road', completedAt: Date.now() - 36 * 3600 * 1000 },
    { id: 'c-plumb-1', title: 'Valve Replacement - Water Main', location: 'Nehru Circle', completedAt: Date.now() - 72 * 3600 * 1000 },
    { id: 'c-muni-1', title: 'Footpath Tile Re-laying', location: 'City Library', completedAt: Date.now() - 5 * 24 * 3600 * 1000 },
  ];

  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const ref = dbRef(rtdb, `appliedJobs/${uid}`);
    const off = onValue(ref, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([id, job]: any) => ({ id, ...(job || {}) }));
      setJobs(arr.filter(j => j.status === 'completed'));
    });
    return () => off();
  }, [uid]);

  return (
  <DashboardLayout title="Completed Jobs" sidebarType="professional">
      <div className="mb-4">
        <button onClick={() => window.location.hash ? (window.location.hash = '#/professional-dashboard') : (window.location.href = '/professional-dashboard')} className="px-3 py-1 border rounded">Back</button>
      </div>
      <ul className="space-y-3">
        {(jobs.length ? jobs : dummyCompleted).map(j => (
          <li key={j.id} className="bg-white rounded border p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" />{j.title}</div>
              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" />{j.location}</div>
            </div>
            <div className="text-sm text-gray-500">Completed: {j.completedAt ? new Date(j.completedAt).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
  </DashboardLayout>
  );
};

export default CompletedJobs;
