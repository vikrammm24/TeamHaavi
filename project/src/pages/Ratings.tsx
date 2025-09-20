import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Star } from 'lucide-react';
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';

const Ratings: React.FC = () => {
  const [reviews, setReviews] = useState<Array<{ id: string; user: string; rating: number; note?: string }>>([]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const ref = dbRef(rtdb, `ratings/${u.uid}`);
    const off = onValue(ref, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([id, r]: any) => ({ id, user: r.user || 'User', rating: Number(r.rating) || 0, note: r.note }));
      setReviews(arr);
    });
    return () => off();
  }, []);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);
  return (
  <DashboardLayout title="Ratings & Reviews" sidebarType="professional">
      <div className="mb-4">
        <button onClick={() => window.location.hash ? (window.location.hash = '#/professional-dashboard') : (window.location.href = '/professional-dashboard')} className="px-3 py-1 border rounded">Back</button>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6 flex items-center gap-4">
          <Star className="w-8 h-8 text-yellow-500" />
          <div>
            <div className="text-2xl font-bold">{avg}</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Recent Reviews</h3>
          <ul className="space-y-3">
            {(reviews.length ? reviews : [
              { id: 'mock1', user: 'Sarah Johnson', rating: 5, note: 'Great work and quick response!' },
              { id: 'mock2', user: 'Mike Chen', rating: 4, note: 'Quality job, could improve timing.' },
            ]).map(r => (
              <li key={r.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.user}</div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500" />)}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{r.note}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
  </DashboardLayout>
  );
};

export default Ratings;
