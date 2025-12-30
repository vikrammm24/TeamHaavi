const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
require('dotenv').config();

// --- IN-MEMORY STORAGE (for demo purposes) ---
// Replace this with a database when you have proper config
let professionals = [
  { id: "1", name: "Dr. Sarah Johnson", skills: ["healthcare", "emergency medicine", "telemedicine"] },
  { id: "2", name: "Mike Chen", skills: ["plumbing", "electrical", "home repair"] },
  { id: "3", name: "Lisa Rodriguez", skills: ["education", "tutoring", "child care"] },
  // Added explicit electrician style professional to improve matching clarity
  { id: "4", name: "Ravi Kumar", skills: ["electrical", "street lighting", "wiring", "maintenance"] }
];
let citizens = [
  { id: "1", name: "John Smith", needs: ["healthcare", "home repair"] },
  { id: "2", name: "Maria Garcia", needs: ["education", "tutoring"] },
  { id: "3", name: "David Wilson", needs: ["plumbing", "electrical"] }
];
let payments = [
  { id: "1", from: "John Smith", to: "Dr. Sarah Johnson", amount: 150, status: "completed", txHash: "0x123abc", timestamp: Date.now() - 86400000 },
  { id: "2", from: "Maria Garcia", to: "Lisa Rodriguez", amount: 75, status: "pending", txHash: "", timestamp: Date.now() - 3600000 }
];
let sensors = [
  { id: "1", type: "air_quality", value: 85, location: "Downtown", status: "active", timestamp: Date.now() },
  { id: "2", type: "traffic", value: 65, location: "Main Street", status: "active", timestamp: Date.now() },
  { id: "3", type: "noise", value: 45, location: "Residential Area", status: "active", timestamp: Date.now() }
];
let verifications = [
  { id: "1", professionalId: "1", name: "Dr. Sarah Johnson", documents: ["medical_license.pdf"], status: "verified", timestamp: Date.now() - 172800000 },
  { id: "2", professionalId: "2", name: "Mike Chen", documents: ["contractor_license.pdf"], status: "pending", timestamp: Date.now() - 86400000 }
];
let issues = [
  // sample
  {
    id: "100",
    title: "Broken Streetlight",
    description: "Streetlight on Main St has been flickering",
    category: "infrastructure",
    priority: "medium",
    location: "40.712776, -74.005974",
    address: "Main Street & 1st Ave",
    photos: [],
    status: "in-progress",
    createdAt: Date.now() - 86400000
  }
];
let polls = [
  {
    id: "poll-1",
    question: "Which neighborhood feature should be prioritized?",
    options: [
      { id: "o1", text: "Road Repairs", votes: 12 },
      { id: "o2", text: "Park Upgrades", votes: 19 },
      { id: "o3", text: "Public Wi-Fi", votes: 7 }
    ],
    closesAt: Date.now() + 7 * 24 * 3600 * 1000
  }
];
// Simple surveys and consultations to enable engagement features
let surveys = [
  {
    id: 'survey-1',
    question: 'How satisfied are you with street lighting in your area?',
    options: [
      { id: 's1', text: 'Very satisfied', count: 5 },
      { id: 's2', text: 'Somewhat satisfied', count: 9 },
      { id: 's3', text: 'Needs improvement', count: 14 },
      { id: 's4', text: 'Poor', count: 6 }
    ],
    closesAt: Date.now() + 5 * 24 * 3600 * 1000
  }
];
let consultations = [
  {
    id: 'con-1',
    topic: 'New Park Redevelopment Plan',
    description: 'Share your feedback on proposed amenities like jogging track, lighting, and play area upgrades.',
    comments: [
      { id: 'c1', name: 'John Smith', message: 'Please add more benches and lighting.', timestamp: Date.now() - 7200_000 },
      { id: 'c2', name: 'Priya', message: 'Include accessible walkways for seniors.', timestamp: Date.now() - 3600_000 }
    ]
  }
];
let leaderboard = [
  { id: 'u1', user: 'John Smith', points: 1200, badges: ['Reporter', 'Voter'] },
  { id: 'u2', user: 'Maria Garcia', points: 980, badges: ['Contributor'] },
  { id: 'u3', user: 'David Wilson', points: 875, badges: ['Reporter'] }
];
// Simple mock vision label source
const VISION_LABELS = ['pothole', 'trash', 'street-light', 'water-logging', 'road-crack'];
let broadcasts = [
  // Active broadcast example
  // { id: 'b1', message: 'Heavy rainfall alert: Avoid Riverside Rd', severity: 'high', active: true, createdAt: Date.now(), expiresAt: Date.now() + 2*3600*1000 }
];
let transport = {
  routes: [
    {
      id: "r1",
      name: "Bus 12",
      nextArrivals: ["09:05", "09:20", "09:35"],
      occupancy: 68,
      suggestedAction: "Add short-turn service at Central Park due to demand spike"
    },
    {
      id: "r2",
      name: "Metro Red Line",
      nextArrivals: ["09:02", "09:07", "09:12"],
      occupancy: 92,
      suggestedAction: "Deploy additional train; crowding detected at Downtown"
    }
  ],
  smartTicketing: {
    enabled: true,
    paymentMethods: ["card", "wallet", "qr"],
    fareSuggestions: [{ route: "Bus 12", offPeakDiscount: 0.15 }]
  }
};
let idCounter = 1000;

function generateId(prefix = "") {
  return prefix + (idCounter++).toString();
}
// --- END IN-MEMORY STORAGE ---

const expressApp = express();
const PORT = process.env.PORT || 4000;

// Security middleware
expressApp.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting to prevent DoS attacks
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

expressApp.use('/api/', limiter);

// Manual NoSQL injection prevention middleware
expressApp.use((req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      const sanitized = {};
      for (const key in value) {
        // Remove keys that start with $ or contain .
        if (!key.startsWith('$') && !key.includes('.')) {
          sanitized[key] = sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
});

expressApp.use(cors());
expressApp.use(bodyParser.json({ limit: '2mb' }));

// Input validation helper
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// Helper to sanitize HTML content
const sanitizeHtml = (dirty) => {
  if (typeof dirty !== 'string') return dirty;
  // Basic HTML sanitization - remove script tags and event handlers
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

// Simple role extraction from headers for demo moderation
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const role = String(req.headers['x-role'] || '').toLowerCase();
    if (!role || (allowedRoles.length && !allowedRoles.includes(role))) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    req.userRole = role;
    next();
  };
}

// Helper functions for in-memory storage
async function getProfessionals() {
  return professionals;
}

async function getCitizens() {
  return citizens;
}

// --- AI matching ---
expressApp.post('/api/match', async (req, res) => {
  const { userType, interests = [] } = req.body || {};
  let matches = [];
  try {
    if (userType === 'citizen') {
      const pros = await getProfessionals();
      matches = pros.filter(prof => prof.skills && prof.skills.some(skill => interests.includes(skill)));
    } else if (userType === 'professional') {
      const cits = await getCitizens();
      matches = cits.filter(cit => cit.needs && cit.needs.some(need => interests.includes(need)));
    }
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// --- Issue to Professional Match Suggestions ---
expressApp.post('/api/issue-match-suggestions', async (req, res) => {
  try {
    const { title = '', description = '', category = '' } = req.body || {};
    const text = `${title} ${description} ${category}`.toLowerCase();
    // Keyword -> canonical skill mapping (extendable)
    const skillMap = {
      electrical: [
        /street\s*light|streetlight|light\s*pole|lamp\s*post|lamp\b/,
        /bulb|led\s+light|flicker|flickering|transformer|wiring|cable|cabling/,
        /electric(al)?|short\s*circuit|power\s*out(age)?/,
      ],
      'street lighting': [/street\s*light|streetlight|light\s*pole|lamp\s*post|lamp\b|public\s+lighting/],
      plumbing: [/leak|pipe|sewer|sewage|drain|water\s+line|tap|पाइप/],
      'home repair': [/pothole|road crack|crack|repair|maintenance/],
      healthcare: [/injur|medical|ambulance|doctor|clinic|health|hospital/],
      education: [/school|teacher|tuition|tutor|education|class/],
      'child care': [/child|kids|children|creche|daycare/]
    };

    function detectNeededSkills() {
      const needed = new Set();
      for (const [skill, patterns] of Object.entries(skillMap)) {
        if (patterns.some(r => r.test(text))) needed.add(skill);
      }
      // Semantic grouping: if street lighting detected, ensure electrical present
      if (needed.has('street lighting')) needed.add('electrical');
      // Fallback heuristics by category or generic words
      if (!needed.size) {
        if (/infrastructure|transport|light|lamp|bulb/.test(text) || /infrastructure|transport/.test(category)) needed.add('electrical');
        if (/environment/.test(category)) needed.add('home repair');
      }
      return Array.from(needed);
    }

    const neededSkills = detectNeededSkills();
    const rankings = professionals.map(p => {
      const matches = (p.skills || []).filter(s => neededSkills.includes(s));
      // Weighted scoring: direct street lighting match boosted
      let base = matches.length / (neededSkills.length || 1);
      if (matches.includes('street lighting')) base += 0.15;
      return { id: p.id, name: p.name, totalSkills: p.skills.length, matched: matches, score: Math.min(base, 1) };
    }).filter(r => r.matched.length > 0)
      .sort((a, b) => b.score - a.score || b.matched.length - a.matched.length || a.name.localeCompare(b.name))
      .slice(0, 5);

    res.json({ neededSkills, professionals: rankings });
  } catch (e) {
    console.error('issue-match-suggestions error', e);
    res.status(500).json({ error: 'Failed to compute match suggestions' });
  }
});

// --- Predictive analytics (simple demo) ---
expressApp.get('/api/analytics', async (req, res) => {
  try {
    const pros = await getProfessionals();
    const cits = await getCitizens();
    const skillCounts = {};
    pros.forEach(prof => (prof.skills || []).forEach(skill => { skillCounts[skill] = (skillCounts[skill] || 0) + 1; }));
    const needCounts = {};
    cits.forEach(cit => (cit.needs || []).forEach(need => { needCounts[need] = (needCounts[need] || 0) + 1; }));

    res.json({ skillCounts, needCounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// --- Issues (geo-tagged) ---
expressApp.get('/api/issues', async (req, res) => {
  try {
    const mine = req.query.mine;
    let filtered = issues;
    if (mine === '1') {
      // Simulate user filtering: expects userId in query or header
      const userId = req.query.userId || req.headers['x-user-id'];
      if (userId) {
        filtered = issues.filter(issue => issue.userId === userId);
      } else {
        // If no userId, return empty array for mine=1
        filtered = [];
      }
    }
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

expressApp.post('/api/issues',
  [
    body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('description').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('category').isString().trim().isIn(['infrastructure', 'transportation', 'utilities', 'environment', 'safety', 'other']).withMessage('Invalid category'),
    body('priority').isString().trim().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('location').optional().isString().trim(),
    body('address').optional().isString().trim().isLength({ max: 300 }),
    body('photos').optional().isArray(),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { title, description, category, priority, location, address, photos } = req.body;
    const id = generateId('issue-');
    const issue = {
      id,
      title: sanitizeHtml(title),
      description: sanitizeHtml(description),
      category,
      priority,
      location: location || '',
      address: sanitizeHtml(address || ''),
      photos: Array.isArray(photos) ? photos.slice(0, 5) : [], // Limit to 5 photos
      status: 'pending',
      createdAt: Date.now()
    };
    issues.unshift(issue);
    res.status(201).json(issue);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// --- Issue auto-suggestion (image/location heuristics) ---
expressApp.post('/api/issue-suggest', async (req, res) => {
  try {
    const { photos = [], location = '', address = '', description = '' } = req.body || {};
    const text = `${address} ${description}`.toLowerCase();
    let suggestions = [];

    function addSuggestion(category, reason, confidence) {
      suggestions.push({ category, reason, confidence });
    }

    if (/pothole|road|asphalt|traffic|bus|metro|train/.test(text) || /bus|metro|train|station|stop/i.test(address)) {
      addSuggestion('transportation', 'Keywords related to road/traffic/transport detected', 0.85);
    }
    if (/streetlight|light|lamp|electric|wiring|signal/.test(text)) {
      addSuggestion('infrastructure', 'Lighting/electrical keywords detected', 0.82);
    }
    if (/water|leak|sewage|pipe|drain/.test(text)) {
      addSuggestion('utilities', 'Water/sewage/pipe keywords detected', 0.8);
    }
    if (/garbage|trash|waste|pollution|smog|air|noise/.test(text)) {
      addSuggestion('environment', 'Environment/waste/pollution keywords detected', 0.78);
    }
    if (/accident|crime|fire|danger|unsafe|violence/.test(text)) {
      addSuggestion('safety', 'Public safety emergency keywords detected', 0.88);
    }

    // Heuristic based on image filename/URL hints
    const photoHints = Array.isArray(photos) ? photos.join(' ').toLowerCase() : '';
    if (photoHints.includes('pothole') || photoHints.includes('road')) {
      addSuggestion('transportation', 'Image hint suggests road condition', 0.7);
    }
    if (photoHints.includes('garbage') || photoHints.includes('trash')) {
      addSuggestion('environment', 'Image hint suggests waste management', 0.7);
    }

    if (suggestions.length === 0) {
      addSuggestion('other', 'No strong signals detected; defaulting to other', 0.4);
    }

    // Deduplicate by category keeping highest confidence
    const bestByCategory = Object.values(
      suggestions.reduce((acc, s) => {
        if (!acc[s.category] || acc[s.category].confidence < s.confidence) acc[s.category] = s;
        return acc;
      }, {})
    ).sort((a, b) => b.confidence - a.confidence);

    res.json({ suggestions: bestByCategory.slice(0, 3) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to suggest category' });
  }
});

// --- Blockchain Payments Endpoints ---
expressApp.get('/api/payments', async (req, res) => {
  try {
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

expressApp.post('/api/payments', async (req, res) => {
  try {
    const { from, to, amount, status, txHash } = req.body;
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'from, to, and amount are required' });
    }
    const id = generateId('pay-');
    const payment = { id, from, to, amount, status: status || 'pending', txHash: txHash || '', timestamp: Date.now() };
    payments.push(payment);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// --- Sensors & CCTV Endpoints ---
expressApp.get('/api/sensors', async (req, res) => {
  try {
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

expressApp.post('/api/sensors', async (req, res) => {
  try {
    const { type, value, location, status } = req.body;
    if (!type || value === undefined) {
      return res.status(400).json({ error: 'type and value are required' });
    }
    const id = generateId('sensor-');
    const sensor = { id, type, value, location: location || '', status: status || 'active', timestamp: Date.now() };
    sensors.push(sensor);
    res.status(201).json(sensor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add sensor' });
  }
});

// --- Professional Verification Endpoints ---
expressApp.get('/api/verifications', async (req, res) => {
  try {
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

expressApp.post('/api/verifications', async (req, res) => {
  try {
    const { professionalId, name, documents } = req.body;
    if (!professionalId || !name) {
      return res.status(400).json({ error: 'professionalId and name are required' });
    }
    const id = generateId('ver-');
    const verification = { id, professionalId, name, documents: documents || [], status: 'pending', timestamp: Date.now() };
    verifications.push(verification);
    res.status(201).json(verification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add verification' });
  }
});

expressApp.patch('/api/verifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const verification = verifications.find(v => v.id === id);
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }
    verification.status = status;
    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// --- Transport optimization & smart ticketing (demo) ---
expressApp.get('/api/transport', async (req, res) => {
  try {
    // Simulate dynamic adjustments based on sensor traffic data
    const traffic = sensors.find(s => s.type === 'traffic');
    if (traffic && traffic.value > 80) {
      transport.routes = transport.routes.map(r => (
        r.name.includes('Bus') ? { ...r, suggestedAction: 'Add express service due to heavy traffic' } : r
      ));
    }
    res.json(transport);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch transport data' });
  }
});

// --- Engagement: Polls ---
expressApp.get('/api/polls', async (req, res) => {
  try {
    res.json(polls);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

expressApp.post('/api/polls/:pollId/vote', async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body || {};
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const opt = poll.options.find(o => o.id === optionId);
    if (!opt) return res.status(400).json({ error: 'Invalid option' });
    opt.votes += 1;
    res.json({ ok: true, poll });
  } catch (e) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// --- Engagement: Surveys ---
expressApp.get('/api/surveys', async (req, res) => {
  try {
    res.json(surveys);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

expressApp.post('/api/surveys/:surveyId/answer', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { optionId } = req.body || {};
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    const opt = survey.options.find(o => o.id === optionId);
    if (!opt) return res.status(400).json({ error: 'Invalid option' });
    opt.count += 1;
    res.json({ ok: true, survey });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// --- Engagement: Public Consultations ---
expressApp.get('/api/consultations', async (req, res) => {
  try {
    res.json(consultations);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

expressApp.post('/api/consultations/:id/comments',
  [
    param('id').isString().trim(),
    body('name').optional().isString().trim().isLength({ max: 100 }),
    body('message').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message } = req.body;
    const con = consultations.find(c => c.id === id);
    if (!con) return res.status(404).json({ error: 'Consultation not found' });
    const cmt = { 
      id: generateId('cmt-'), 
      name: sanitizeHtml(name || 'Anonymous'), 
      message: sanitizeHtml(message), 
      timestamp: Date.now() 
    };
    con.comments.push(cmt);
    res.status(201).json(cmt);
  } catch (e) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Moderation: flag a comment
expressApp.post('/api/consultations/:id/comments/:commentId/flag', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const con = consultations.find(c => c.id === id);
    if (!con) return res.status(404).json({ error: 'Consultation not found' });
    const cmt = con.comments.find(cm => cm.id === commentId);
    if (!cmt) return res.status(404).json({ error: 'Comment not found' });
    cmt.flagged = true;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to flag comment' });
  }
});

// Moderation: delete a comment
expressApp.delete('/api/consultations/:id/comments/:commentId', requireRole(['authority','professional']), async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const con = consultations.find(c => c.id === id);
    if (!con) return res.status(404).json({ error: 'Consultation not found' });
    const before = con.comments.length;
    con.comments = con.comments.filter(cm => cm.id !== commentId);
    if (con.comments.length === before) return res.status(404).json({ error: 'Comment not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// --- Gamification Leaderboard ---
expressApp.get('/api/gamification/leaderboard', async (req, res) => {
  try {
    const sorted = [...leaderboard].sort((a, b) => b.points - a.points);
    res.json(sorted);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// --- Emergency broadcasts ---
expressApp.get('/api/emergency-broadcasts/active', async (req, res) => {
  try {
    const now = Date.now();
    const active = broadcasts.find(b => b.active && (!b.expiresAt || b.expiresAt > now));
    res.json(active || null);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch broadcast' });
  }
});

expressApp.post('/api/emergency-broadcasts',
  [
    body('message').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Message must be 10-500 characters'),
    body('severity').optional().isString().isIn(['info', 'warning', 'high', 'critical']),
    body('ttlMinutes').optional().isInt({ min: 1, max: 1440 }).withMessage('TTL must be 1-1440 minutes'),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { message, severity = 'info', ttlMinutes = 120 } = req.body;
    // deactivate previous active
    broadcasts = broadcasts.map(b => ({ ...b, active: false }));
    const id = generateId('b-');
    const createdAt = Date.now();
    const expiresAt = createdAt + ttlMinutes * 60 * 1000;
    const broadcast = { id, message: sanitizeHtml(message), severity, active: true, createdAt, expiresAt };
    broadcasts.unshift(broadcast);
    res.status(201).json(broadcast);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

// --- Civic Sentiment Analysis (demo) ---
expressApp.get('/api/sentiment', async (req, res) => {
  try {
    // Simple mock sentiment over recent issues titles/descriptions
    const texts = issues.slice(0, 20).map(i => `${i.title} ${i.description}`.toLowerCase());
    const positives = ['improve', 'fix', 'resolved', 'clean', 'upgrade'];
    const negatives = ['broken', 'pothole', 'delay', 'overcrowd', 'leak'];
    let pos = 0, neg = 0;
    texts.forEach(t => {
      positives.forEach(p => { if (t.includes(p)) pos++; });
      negatives.forEach(n => { if (t.includes(n)) neg++; });
    });
    const total = pos + neg || 1;
    const score = Math.round(((pos - neg) / total) * 100) / 100;
    res.json({ score, pos, neg, total, topTopics: ['roads', 'lighting', 'waste', 'traffic'] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute sentiment' });
  }
});

// --- Multilingual Knowledge-Based Assistant ---
// Simple extensible knowledge base with patterns -> answers in multiple languages
const ASSISTANT_LANGS = ['en','hi','es','mr','te','fr'];

// External Knowledge Base support (JSON file), optional
const KB_DIR = path.join(__dirname, 'assistant');
const KB_PATH = path.join(KB_DIR, 'kb.json');
const UNKNOWN_LOG = path.join(KB_DIR, 'unknown.log');
let externalKB = [];

function ensureKbDir() {
  try { if (!fs.existsSync(KB_DIR)) fs.mkdirSync(KB_DIR, { recursive: true }); } catch {}
}

function loadExternalKB() {
  ensureKbDir();
  try {
    if (fs.existsSync(KB_PATH)) {
      const raw = fs.readFileSync(KB_PATH, 'utf8');
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        externalKB = arr.map(entry => ({
          ...entry,
          _patterns: Array.isArray(entry.patterns) ? entry.patterns.map(p => new RegExp(p, 'i')) : [],
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to load external KB', e);
    externalKB = [];
  }
}

function saveExternalKB() {
  ensureKbDir();
  try {
    const serializable = externalKB.map(({ _patterns, ...rest }) => rest);
    fs.writeFileSync(KB_PATH, JSON.stringify(serializable, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to save external KB', e);
  }
}

loadExternalKB();

const knowledgeBase = [
  {
    topic: 'about',
    patterns: [/what\s+is\s+cityconnect/i, /about\s+city\s*connect/i, /cityconnect\s+(app|application)/i, /cityconnect काय/i, /cityconnect ఏమిటి/i],
    answers: {
      en: 'CityConnect is a civic engagement platform: report local issues, track resolutions, view transport info, vote in polls, and earn points & badges.',
      hi: 'CityConnect एक नागरिक सहभागिता प्लेटफ़ॉर्म है: समस्याएँ दर्ज करें, समाधान ट्रैक करें, परिवहन जानकारी देखें, पोल में वोट करें और अंक व बैज अर्जित करें।',
      es: 'CityConnect es una plataforma de participación cívica: reporta incidencias, sigue resoluciones, consulta transporte, vota en encuestas y gana puntos y medallas.',
      mr: 'CityConnect हे नागरी सहभागाचे व्यासपीठ आहे: स्थानिक तक्रारी नोंदवा, निराकरणे ट्रॅक करा, परिवहन माहिती पाहा, मतदान करा आणि गुण व बॅज मिळवा.',
      te: 'CityConnect ఒక పౌర భాగస్వామ్య వేదిక: సమస్యలను నివేదించండి, పరిష్కారాలను ట్రాక్ చేయండి, రవాణా సమాచారం చూడండి, పోల్స్‌లో ఓటు వేయండి, పాయింట్లు & బ్యాడ్జ్లు సంపాదించండి.',
      fr: 'CityConnect est une plateforme d’engagement civique : signalez des problèmes, suivez les résolutions, consultez les transports, votez aux sondages et gagnez des points et des badges.'
    }
  },
  {
    topic: 'report_issue',
    patterns: [/how\s+to\s+report/i, /report\s+issue/i, /शिकायत/i, /तक्रार/i, /సమస్య.*నివేద/i],
    answers: {
      en: 'Use the Report Issue page: add a clear title, description, location (map or auto), and photo evidence for faster action.',
      hi: 'रिपोर्ट इश्यू पेज पर जाएँ: शीर्षक, विवरण, स्थान (मानचित्र/ऑटो) और फ़ोटो जोड़ें—इससे तेज़ कार्रवाई होती है।',
      es: 'Ve a Report Issue: añade título, descripción, localización y una foto para agilizar la respuesta.',
      mr: '"Report Issue" पृष्ठ वापरा: शीर्षक, वर्णन, स्थान आणि फोटो जोडल्यास जलद कार्यवाही मिळते.',
      te: 'Report Issue పేజీకి వెళ్లి: శీర్షిక, వివరణ, స్థానం, ఫోటో జోడించండి — ఇది వేగంగా చర్యకు సహాయపడుతుంది.',
      fr: 'Utilisez la page « Report Issue » : ajoutez un titre clair, une description, la localisation (carte ou auto) et une photo pour accélérer le traitement.'
    }
  },
  {
    topic: 'gamification',
    patterns: [/points/i, /badges/i, /leaderboard/i, /अंक/i, /पॉइंट/i, /गुण/i, /పాయింట్/i],
    answers: {
      en: 'You earn points for reporting issues, voting in polls, and sustained engagement. Badges unlock at milestones; see the Leaderboard for top contributors.',
      hi: 'आपको अंक समस्याएँ दर्ज करने, पोल में वोट करने और निरंतर भागीदारी पर मिलते हैं। माइलस्टोन पर बैज अनलॉक होते हैं; टॉप योगदानकर्ताओं के लिए लीडरबोर्ड देखें।',
      es: 'Ganas puntos por reportar incidencias, votar y participar. Las medallas se desbloquean con hitos; consulta el Leaderboard.',
      mr: 'तक्रारी नोंदवणे, मतदान करणे आणि सातत्यपूर्ण सहभाग यासाठी गुण मिळतात. माइलस्टोनवर बॅज अनलॉक होतात; लीडरबोर्ड पाहा.',
      te: 'సమస్యలు నివేదించడం, పోల్స్‌లో ఓటు వేయడం, నిరంతర భాగస్వామ్యంతో పాయింట్లు వస్తాయి. మైల్స్‌టోన్‌ల వద్ద బ్యాడ్జ్‌లు అన్‌లాక్ అవుతాయి; లీడర్‌బోర్డ్ చూడండి.',
      fr: 'Vous gagnez des points en signalant des problèmes, en votant et en participant. Des badges se débloquent à des paliers ; consultez le Leaderboard.'
    }
  },
  {
    topic: 'transport',
    patterns: [/bus/i, /metro/i, /train/i, /transport/i, /परिवहन/i, /बस/i, /रेल्वे/i, /बस.*वेळ/i, /బస్/i, /మెట్రో/i],
    answers: {
      en: 'Transport section shows dynamic routes, next arrivals, occupancy and suggestions. Ask: "bus status" or check dashboard widgets.',
      hi: 'परिवहन अनुभाग में रूट, अगली आगमन समय, भीड़ और सुझाव दिखते हैं। "बस स्टेटस" पूछ सकते हैं या डैशबोर्ड देखें।',
      es: 'La sección de transporte muestra rutas, próximas llegadas, ocupación y sugerencias. Puedes preguntar: "estado bus".',
      mr: 'परिवहन विभागात मार्ग, पुढील आगमन, गर्दी आणि सूचनांची माहिती असते. "बस स्थिती" विचारा किंवा डॅशबोर्ड पहा.',
      te: 'రవాణా విభాగం మార్గాలు, తదుపరి రాకలు, ఆక్యుపెన్సీ & సూచనలు చూపుతుంది. "bus status" అని అడగవచ్చు లేదా డ్యాష్‌బోర్డ్ చూడండి.',
      fr: 'La section Transport affiche les lignes, prochaines arrivées, taux d’occupation et suggestions. Demandez : « bus status » ou voyez le tableau de bord.'
    }
  },
  {
    topic: 'privacy',
    patterns: [/privacy/i, /data\s+use/i, /security/i, /सुरक्षा/i, /गोपनीयता/i, /privacy policy/i],
    answers: {
      en: 'Only necessary data (issue details, basic profile) is stored. Location is optional; media is used solely for issue resolution. Future versions may add granular controls.',
      hi: 'केवल ज़रूरी डेटा (समस्या विवरण, बुनियादी प्रोफ़ाइल) सुरक्षित होता है। स्थान वैकल्पिक है; मीडिया सिर्फ़ समाधान हेतु उपयोग होता है। भविष्य में अधिक नियंत्रक विकल्प आएंगे।',
      es: 'Solo almacenamos datos necesarios (detalle de incidencia, perfil básico). Ubicación es opcional; las fotos solo ayudan a resolver.',
      mr: 'फक्त आवश्यक डेटा (तक्रार माहिती, मूलभूत प्रोफाइल) जतन केला जातो. लोकेशन वैकल्पिक आहे; फोटो फक्त निराकरणासाठी वापरले जातात.',
      te: 'అవసరమైన డేటా మాత్రమే (సమస్య వివరాలు, ప్రాథమిక ప్రొఫైల్) నిల్వ. స్థానం ఐచ్ఛికం; మీడియా సమస్య పరిష్కారానికే ఉపయోగిస్తుంది.',
      fr: 'Nous stockons uniquement les données nécessaires (détails du signalement, profil basique). La localisation est optionnelle ; les photos servent à la résolution.'
    }
  },
  {
    topic: 'help',
    patterns: [/^help$/i, /help\b/i, /madad/i, /ayuda/i, /सहायता/i, /मदत/i, /సహాయం/i],
    answers: {
      en: 'I can help you: report issues, view transport, vote in polls, see gamification stats, or check civic sentiment. Ask: "how to report" or "points".',
      hi: 'मैं आपकी मदद कर सकता हूँ: समस्या दर्ज करें, परिवहन देखें, पोल में वोट करें, गेमिफिकेशन आँकड़े देखें। पूछें: "कैसे रिपोर्ट करें" या "अंक"।',
      es: 'Puedo ayudarte: reportar, transporte, votar en encuestas, gamificación. Pregunta: "cómo reportar" o "puntos".',
      mr: 'मी मदत करू शकतो: तक्रार नोंदवा, परिवहन पाहा, मतदान करा, गुण पहा. विचारा: "तक्रार कशी" किंवा "गुण".',
      te: 'నేను సహాయపడగలను: సమస్య నివేదించు, రవాణా చూడండి, పోల్స్‌లో ఓటు వేయండి, పాయింట్లు చూడండి. అడగండి: "how to report" లేదా "points".',
      fr: 'Je peux vous aider : signaler un problème, voir le transport, voter, consulter vos points. Demandez : « comment signaler » ou « points ».'
    }
  }
];

const genericReplies = {
  en: { unknown: 'I logged your message. Try asking about points, reporting, transport, or type "help".' },
  hi: { unknown: 'मैंने आपका संदेश दर्ज कर लिया। "help" या "अंक" / "रिपोर्ट" पूछें।' },
  es: { unknown: 'He registrado tu mensaje. Pregunta por puntos, reportar, transporte o escribe "help".' },
  mr: { unknown: 'मी तुमचा संदेश नोंदवला आहे. "help", "गुण" किंवा "तक्रार" विचारा.' },
  te: { unknown: 'మీ సందేశం నమోదైంది. "help", "points" లేదా "report" అడగండి.' },
  fr: { unknown: 'J’ai bien reçu votre message. Demandez « points », « comment signaler », « transport » ou tapez « help ».' }
};

function matchTopic(text) {
  // 1) Try external KB first
  for (const entry of externalKB) {
    if (Array.isArray(entry._patterns) && entry._patterns.some(p => p.test(text))) return entry;
  }
  // 2) Fallback to built-in KB
  for (const entry of knowledgeBase) {
    if (entry.patterns.some(p => p.test(text))) return entry;
  }
  return null;
}

expressApp.post('/api/assistant', async (req, res) => {
  try {
    const { message = '', language = 'en' } = req.body || {};
    const lang = ASSISTANT_LANGS.includes(language) ? language : 'en';
    const lower = String(message).trim().toLowerCase();
    if (!lower) {
      return res.json({ reply: (genericReplies[lang] || genericReplies.en).unknown });
    }

    const matched = matchTopic(lower);
    if (matched) {
      const answers = matched.answers || {};
      const answer = answers[lang] || answers.en || (genericReplies[lang] || genericReplies.en).unknown;
      return res.json({ reply: answer, topic: matched.topic });
    }
    // fallback heuristics for transport keywords not covered
    if (/\b(bus|metro|train|transport)\b/.test(lower)) {
      return res.json({ reply: (knowledgeBase.find(k=>k.topic==='transport').answers[lang]) });
    }
    const pack = genericReplies[lang] || genericReplies.en;
    // Log unknowns for training
    try {
      ensureKbDir();
      fs.appendFileSync(UNKNOWN_LOG, JSON.stringify({ t: Date.now(), lang, message }) + '\n');
    } catch {}
    return res.json({ reply: pack.unknown });
  } catch (e) {
    console.error('Assistant error', e);
    res.status(500).json({ error: 'Assistant failed' });
  }
});

// --- Assistant KB management (basic) ---
// Get current KB entries (external only)
expressApp.get('/api/assistant/kb', (req, res) => {
  const data = externalKB.map(({ _patterns, ...rest }) => rest);
  res.json({ items: data });
});

// Add or update a KB entry
// Body: { topic, patterns: string[], answers: { lang: text } }
expressApp.post('/api/assistant/kb', (req, res) => {
  try {
    const { topic, patterns, answers } = req.body || {};
    if (!topic || !Array.isArray(patterns) || !answers) {
      return res.status(400).json({ error: 'topic, patterns[], answers required' });
    }
    const existing = externalKB.find(e => e.topic === topic);
    if (existing) {
      if (Array.isArray(patterns) && patterns.length) {
        const merged = Array.from(new Set([...(existing.patterns || []), ...patterns]));
        existing.patterns = merged;
        existing._patterns = merged.map(p => new RegExp(p, 'i'));
      }
      existing.answers = { ...(existing.answers || {}), ...answers };
    } else {
      externalKB.push({ topic, patterns, answers, _patterns: patterns.map(p => new RegExp(p, 'i')) });
    }
    saveExternalKB();
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update KB' });
  }
});

// Quick teach endpoint for a single Q/A
// Body: { question: string, answer: string, language?: string, topic?: string }
expressApp.post('/api/assistant/teach',
  [
    body('question').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Question must be 3-200 characters'),
    body('answer').isString().trim().isLength({ min: 3, max: 1000 }).withMessage('Answer must be 3-1000 characters'),
    body('language').optional().isString().isIn(ASSISTANT_LANGS),
    body('topic').optional().isString().trim().isLength({ max: 50 }),
    handleValidationErrors,
  ],
  (req, res) => {
  try {
    const { question, answer, language = 'en', topic = 'custom' } = req.body;
    const lang = ASSISTANT_LANGS.includes(language) ? language : 'en';
    const entry = externalKB.find(e => e.topic === topic);
    const pattern = escapeRegex(String(question).trim());
    if (entry) {
      entry.patterns = Array.from(new Set([...(entry.patterns || []), pattern]));
      entry._patterns = entry.patterns.map(p => new RegExp(p, 'i'));
      entry.answers = { ...(entry.answers || {}), [lang]: sanitizeHtml(String(answer)) };
    } else {
      externalKB.push({ topic, patterns: [pattern], answers: { [lang]: sanitizeHtml(String(answer)) }, _patterns: [new RegExp(pattern, 'i')] });
    }
    saveExternalKB();
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to teach' });
  }
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Vision classification endpoint (mock) ---
expressApp.post('/api/vision/classify', async (req, res) => {
  try {
    const { images = [] } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'images (array) required' });
    }
    const result = {};
    images.forEach(url => {
      // Pick 1-2 random labels deterministically-ish by hashing the URL length
      const count = (url.length % 2) + 1;
      const labels = [...VISION_LABELS]
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map((label, i) => ({ label, confidence: 0.6 + Math.random() * 0.35 - i * 0.1 }));
      result[url] = labels;
    });
    res.json({ classifications: result });
  } catch (e) {
    res.status(500).json({ error: 'Vision classify failed' });
  }
});

// --- Directory: basic CRUD additions for pros/citizens (from previous) ---
expressApp.post('/api/professionals',
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
    body('skills.*').isString().trim().isLength({ min: 2, max: 50 }),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { name, skills } = req.body;
    const id = generateId('pro-');
    const professional = { id, name: sanitizeHtml(name), skills: skills.map(s => sanitizeHtml(s)) };
    professionals.push(professional);
    res.status(201).json(professional);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add professional' });
  }
});

expressApp.post('/api/citizens',
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('needs').isArray({ min: 1 }).withMessage('At least one need is required'),
    body('needs.*').isString().trim().isLength({ min: 2, max: 50 }),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { name, needs } = req.body;
    const id = generateId('cit-');
    const citizen = { id, name: sanitizeHtml(name), needs: needs.map(n => sanitizeHtml(n)) };
    citizens.push(citizen);
    res.status(201).json(citizen);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add citizen' });
  }
});

expressApp.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
