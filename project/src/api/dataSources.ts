import api from './config';

export const SECUNDERABAD = { lat: 17.4399, lng: 78.4983 };

export function haversineKm(a: {lat:number,lng:number}, b: {lat:number,lng:number}) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

// General helper: safely GET with sample fallback
async function safeGet<T>(path: string, sample: T): Promise<T> {
  try {
    const res = await api.get(path);
    if (res && res.data !== undefined && res.data !== null) {
      return res.data as T;
    }
  } catch {}
  return sample;
}

async function safePost<T>(path: string, body: any, sample: T): Promise<T> {
  try {
    const res = await api.post(path, body);
    if (res && res.data !== undefined && res.data !== null) {
      return res.data as T;
    }
  } catch {}
  return sample;
}

// Sample data generators
const samples = {
  matches: (role: 'citizen'|'authority'|'professional') => {
    if (role === 'citizen') {
      return { matches: [ { id: 'p1', name: 'Ravi Electricals', skills: ['plumbing'] }, { id: 'p2', name: 'Sharma Paints', skills: ['painting'] } ] };
    }
    if (role === 'professional') {
      return { matches: [ { id: 'c1', name: 'Rahul Verma', needs: ['carpentry'] }, { id: 'c2', name: 'Priya Iyer', needs: ['plumbing'] } ] };
    }
    return { matches: [] };
  },
  analytics: () => ({ forecast: { issuesNextWeek: 42, severity: { low: 20, medium: 15, high: 7 } }, hotspots: ['Secunderabad', 'Paradise Circle'] }),
  payments: () => ([
    { id: 'tx1', from: 'Secunderabad Municipal', to: 'Hyderabad Clean Services', amount: 250, status: 'confirmed', txHash: '0xabc123', timestamp: Date.now()-3600_000 },
    { id: 'tx2', from: 'Secunderabad Municipal', to: 'Secunderabad RoadFix Pvt Ltd', amount: 580, status: 'pending', txHash: '0xdef456', timestamp: Date.now()-7200_000 }
  ]),
  sensors: () => ([
    { id: 's1', type: 'Air Quality', value: 'PM2.5: 32', location: 'Paradise Circle, Secunderabad', status: 'ok', timestamp: Date.now() },
    { id: 's2', type: 'Traffic', value: 'High', location: 'Sarojini Devi Road, Secunderabad', status: 'warning', timestamp: Date.now() }
  ]),
  broadcast: () => ({ id: 'b1', severity: 'high', message: 'Heavy rainfall alert in Secunderabad area', expiresAt: Date.now()+3600_000 }),
  polls: () => ([
    { id: 'poll1', question: 'Preferred park improvements?', closesAt: Date.now()+86400_000, options: [ { id: 'o1', text: 'Lighting', votes: 12 }, { id: 'o2', text: 'Benches', votes: 8 } ] },
  ]),
  surveys: () => ([
    { id: 'survey-1', question: 'How satisfied are you with street lighting in your area?', closesAt: Date.now()+43200_000, options: [
      { id: 's1', text: 'Very satisfied', count: 5 },
      { id: 's2', text: 'Somewhat satisfied', count: 9 },
      { id: 's3', text: 'Needs improvement', count: 14 },
      { id: 's4', text: 'Poor', count: 6 }
    ]}
  ]),
  consultations: () => ([
    { id: 'con-1', topic: 'New Park Redevelopment Plan', description: 'Feedback on amenities like jogging track, lighting, and play area upgrades.', comments: [
      { id: 'c1', name: 'John Smith', message: 'Please add more benches and lighting.', timestamp: Date.now()-7200_000 },
      { id: 'c2', name: 'Priya', message: 'Include accessible walkways for seniors.', timestamp: Date.now()-3600_000 }
    ]}
  ]),
  transport: () => ({
    routes: [ { id: 'r1', name: 'Bus 12', nextArrivals: ['10:15','10:35','10:55'], occupancy: 68, suggestedAction: 'Add one more bus at 11:00' } ],
    smartTicketing: { activeUsers: 245, fraudAttemptsBlocked: 3 }
  }),
  leaderboard: () => ([
    { id: 'u1', user: 'Rahul Verma', points: 1200, badges: ['Helper','Reporter'] },
    { id: 'u2', user: 'Priya Iyer', points: 980, badges: ['Responder'] },
  ]),
  verifications: () => ([
    { id: 'v1', name: 'Secunderabad Fixers Pvt Ltd', status: 'pending' },
    { id: 'v2', name: 'Hyderabad Clean Services', status: 'approved' }
  ]),
};

// Secunderabad samples
export function sampleIssuesSecunderabad() {
  const now = Date.now();
  return [
    {
      id: 'i1',
      title: 'Open pothole at SD Road',
      description: 'Large pothole causing congestion near the junction',
      status: 'pending',
      priority: 'high',
      location: 'Sarojini Devi Road, Secunderabad',
      createdAt: new Date(now - 40 * 60 * 1000),
      lat: 17.439, lng: 78.498,
      likes: ['u1', 'u2'],
      comments: [
        { id: 'c1', user: 'Rahul Verma', text: 'This needs urgent attention!', createdAt: new Date(now - 35 * 60 * 1000) },
        { id: 'c2', user: 'Priya Iyer', text: 'Shared with my group.', createdAt: new Date(now - 30 * 60 * 1000) }
      ]
    },
    {
      id: 'i2',
      title: 'Streetlight outage near Paradise',
      description: 'Multiple lights not working around Paradise Circle',
      status: 'in-progress',
      priority: 'medium',
      location: 'Paradise Circle, Secunderabad',
      createdAt: new Date(now - 3 * 3600 * 1000),
      assignedTo: 'Electric Dept.',
      estimatedCompletion: new Date(now + 12 * 3600 * 1000),
      lat: 17.4415, lng: 78.4930,
      likes: ['u2'],
      comments: [
        { id: 'c3', user: 'Electric Dept.', text: 'We are working on it.', createdAt: new Date(now - 2 * 3600 * 1000) }
      ]
    },
    {
      id: 'i3',
      title: 'Garbage overflow at Monda Market',
      description: 'Bins overflowing; needs immediate clearance',
      status: 'resolved',
      priority: 'low',
      location: 'Monda Market, Secunderabad',
      createdAt: new Date(now - 2 * 86400 * 1000),
      resolvedAt: new Date(now - 1 * 86400 * 1000),
      lat: 17.4375, lng: 78.5022,
      likes: [],
      comments: []
    }
  ];
}

// Normalizers
export function normalizeIssue(r: any) {
  return {
    id: String(r.id ?? r._id ?? Math.random().toString(36).slice(2)),
    title: String(r.title ?? 'Untitled Issue'),
    description: String(r.description ?? ''),
    status: (r.status === 'in-progress' || r.status === 'resolved' || r.status === 'pending') ? r.status : 'pending',
    priority: (r.priority === 'low' || r.priority === 'medium' || r.priority === 'high') ? r.priority : 'medium',
    location: String(r.location ?? r.address ?? 'Unknown'),
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
    assignedTo: r.assignedTo ? String(r.assignedTo) : undefined,
    estimatedCompletion: r.estimatedCompletion ? new Date(r.estimatedCompletion) : undefined,
    resolvedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
    lat: typeof r.lat === 'number' ? r.lat : (r.coords?.lat ?? undefined),
    lng: typeof r.lng === 'number' ? r.lng : (r.coords?.lng ?? undefined),
    likes: Array.isArray(r.likes) ? r.likes : [],
    comments: Array.isArray(r.comments) ? r.comments : [],
  } as any;
}

export function normalizeActivity(a: any) {
  return {
    id: String(a.id ?? Math.random().toString(36).slice(2)),
    type: a.type ?? 'reported',
    message: a.message ?? 'Activity',
    user: a.user ?? 'User',
    time: a.time ?? 'just now',
    lat: typeof a.lat === 'number' ? a.lat : (a.coords?.lat ?? undefined),
    lng: typeof a.lng === 'number' ? a.lng : (a.coords?.lng ?? undefined),
  };
}

// Public API
export async function fetchMatches(role: 'citizen'|'authority'|'professional', interests: string[]) {
  return safePost<{ matches: any[] }>('/match', { userType: role, interests }, samples.matches(role));
}

export async function fetchAnalytics() { return safeGet<any>('/analytics', samples.analytics()); }
export async function fetchPayments() { return safeGet<any[]>('/payments', samples.payments()); }
export async function fetchSensors() { return safeGet<any[]>('/sensors', samples.sensors()); }
export async function fetchBroadcast() { return safeGet<any | null>('/emergency-broadcasts/active', samples.broadcast()); }
export async function fetchPolls() { return safeGet<any[]>('/polls', samples.polls()); }
export async function fetchTransport() { return safeGet<any>('/transport', samples.transport()); }
export async function fetchLeaderboard() { return safeGet<any[]>('/gamification/leaderboard', samples.leaderboard()); }
export async function fetchVerifications() { return safeGet<any[]>('/verifications', samples.verifications()); }
export async function fetchSurveys() { return safeGet<any[]>('/surveys', samples.surveys()); }
export async function fetchConsultations() { return safeGet<any[]>('/consultations', samples.consultations()); }
export async function answerSurvey(surveyId: string, optionId: string) { return safePost<any>(`/surveys/${surveyId}/answer`, { optionId }, {} as any); }
export async function addConsultationComment(id: string, name: string, message: string) { return safePost<any>(`/consultations/${id}/comments`, { name, message }, {} as any); }
export async function flagConsultationComment(id: string, commentId: string) { return safePost<any>(`/consultations/${id}/comments/${commentId}/flag`, {}, {} as any); }
export async function deleteConsultationComment(id: string, commentId: string, role: 'authority'|'professional'='authority') {
  try {
    const res = await api.delete(`/consultations/${id}/comments/${commentId}`, { headers: { 'x-role': role } });
    return res.data;
  } catch {
    return {} as any;
  }
}

// Local issues storage and merge
const LOCAL_ISSUES_KEY = 'localIssues';
export function getLocalIssues(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_ISSUES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
export function addLocalIssue(issue: any) {
  try {
    const arr = getLocalIssues();
    arr.push(issue);
    localStorage.setItem(LOCAL_ISSUES_KEY, JSON.stringify(arr));
  } catch {}
}
function mergeWithLocalIssues(arr: any[]): any[] {
  return [...(Array.isArray(arr) ? arr : []), ...getLocalIssues()];
}

// Issues and activity
export async function fetchIssues() {
  const base = await safeGet<any[]>('/issues', sampleIssuesSecunderabad());
  return mergeWithLocalIssues(base);
}
export async function fetchMyIssues() {
  const base = await safeGet<any[]>('/issues?mine=1', sampleIssuesSecunderabad());
  return mergeWithLocalIssues(base);
}
export async function fetchCommunityActivity() { return safeGet<any[]>('/community-activity', []); }

// Jobs
export async function fetchJobs() { return safeGet<any[]>('/jobs', []); }
export async function fetchMyJobs() { return safeGet<any[]>('/my-jobs', []); }
