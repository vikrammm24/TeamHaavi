import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useNotifications } from '../contexts/NotificationContext';
import { auth, rtdb } from '../components/firebase/firebase';
import { ref as dbRef, get as dbGet, set as dbSet } from 'firebase/database';

type Application = {
  fullName: string;
  phone: string;
  yearsExperience: string;
  availabilityDate: string;
  expectedRate: string;
  notes: string;
};

const JobApplication: React.FC = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const job = (location.state as any)?.job as { id: string; title?: string } | undefined;

  const [initializing, setInitializing] = useState(true);
  const [app, setApp] = useState<Application>({
    fullName: '',
    phone: '',
    yearsExperience: '',
    availabilityDate: '',
    expectedRate: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const user = auth.currentUser;
        if (user && jobId) {
          // Prefill from previous saved application if exists
          const appRef = dbRef(rtdb, `appliedJobs/${user.uid}/${jobId}/application`);
          const snap = await dbGet(appRef);
          if (mounted && snap.exists()) {
            setApp((prev) => ({ ...prev, ...(snap.val() || {}) }));
          }
          // Prefill name/email if available
          if (mounted) {
            setApp((prev) => ({
              ...prev,
              fullName: prev.fullName || user.displayName || '',
              notes: prev.notes || '',
            }));
          }
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    };
    bootstrap();
    return () => { mounted = false; };
  }, [jobId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApp((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !jobId) {
      addNotification?.({ type: 'warning', title: 'Login required', message: 'Please log in to apply.' });
      return;
    }
    try {
      const payload = {
        ...app,
        submittedAt: Date.now(),
        applicantUid: user.uid,
        applicantEmail: user.email || '',
      };
      await dbSet(dbRef(rtdb, `appliedJobs/${user.uid}/${jobId}/application`), payload);
      addNotification?.({
        type: 'success',
        title: 'Thank you for applying',
        message: 'Your form has been successfully submitted.'
      });
      setSubmitted(true);
    } catch (e: any) {
      addNotification?.({ type: 'error', title: 'Save failed', message: String(e?.message || e) });
    }
  };

  if (initializing) {
    return (
  <DashboardLayout title="Job Application" sidebarType="professional">
        <div className="p-6 text-gray-600">Loading application…</div>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout title="Job Application" sidebarType="professional">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
        </div>
        {submitted && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-800 p-3">
            <div className="font-medium">Thank you for applying</div>
            <div className="text-sm">Your form has been successfully submitted.</div>
          </div>
        )}
        {job?.title && (
          <h1 className="text-xl font-semibold mb-4">Applying for: {job.title}</h1>
        )}
        <form onSubmit={onSubmit} className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="fullName" value={app.fullName} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={app.phone} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="e.g., +91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input name="yearsExperience" value={app.yearsExperience} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="e.g., 3" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Availability Date</label>
              <input type="date" name="availabilityDate" value={app.availabilityDate} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Rate (per hour/day)</label>
              <input name="expectedRate" value={app.expectedRate} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="e.g., ₹800/day" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" value={app.notes} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2 h-28" placeholder="Cover letter, certifications, tools you carry, etc." />
          </div>
          <div className="pt-2">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Submit Application</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JobApplication;
