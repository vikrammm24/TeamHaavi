import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { rtdb, auth } from '../components/firebase/firebase';
import { ref as dbRef, get as dbGet } from 'firebase/database';

type Job = {
  id: string;
  title: string;
  description: string;
  location?: string;
  priority?: string;
  budget?: string | number;
  estimatedDuration?: string;
  postedAt?: string;
};

const JobDetails: React.FC = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const stateJob = (location.state as any)?.job as Job | undefined;
        if (stateJob && mounted) setJob(stateJob);
        const user = auth.currentUser;
        if (user && jobId) {
          const appliedRef = dbRef(rtdb, `appliedJobs/${user.uid}/${jobId}`);
          const appliedSnap = await dbGet(appliedRef);
          if (mounted) setApplied(appliedSnap.exists());
          if (!stateJob) {
            const detailsRef = dbRef(rtdb, `jobDetails/${user.uid}/${jobId}`);
            const detailsSnap = await dbGet(detailsRef);
            if (detailsSnap.exists() && mounted) {
              const v = detailsSnap.val();
              setJob({ id: jobId, ...v });
            }
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrap();
    return () => { mounted = false; };
  }, [jobId, location.state]);

  if (loading) {
    return (
  <DashboardLayout title="Job Details" sidebarType="professional">
        <div className="p-6 text-gray-600">Loading job…</div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
  <DashboardLayout title="Job Details" sidebarType="professional">
        <div className="p-6 text-gray-600">Job not found.</div>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout title="Job Details" sidebarType="professional">
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
        <div className="bg-white rounded-lg p-6 border">
          <h1 className="text-2xl font-semibold mb-2">{job.title}</h1>
          <div className="text-gray-600 mb-4">{job.description}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            {job.location && <div><span className="font-medium">Location:</span> {job.location}</div>}
            {job.priority && <div><span className="font-medium">Priority:</span> {job.priority}</div>}
            {job.budget !== undefined && <div><span className="font-medium">Budget:</span> {String(job.budget)}</div>}
            {job.estimatedDuration && <div><span className="font-medium">Duration:</span> {job.estimatedDuration}</div>}
            {job.postedAt && <div><span className="font-medium">Posted:</span> {job.postedAt}</div>}
          </div>
          <div className="mt-6">
            <span className={`px-3 py-1 rounded ${applied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {applied ? 'Applied' : 'Not Applied'}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
