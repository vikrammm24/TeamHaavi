# CityConnect

A civic engagement platform that empowers citizens to report local issues, helps authorities coordinate responses, connects professionals to resolve problems, and keeps communities informed with transport and emergency updates. Engagement is encouraged through points, badges, and leaderboards. The assistant is multilingual and trainable without redeploys.

## Features
- Report issues: geo-tagged reports with auto-suggestions and media
- Dashboards: Citizen, Authority, and Professional views
- Gamification: points, badges, leaderboards, and Daily Task
- Notifications: accessible bell + panel, emergency broadcasts
- Transport: routes, arrivals, occupancy, smart ticketing suggestions
- Community input: polls, surveys, public consultations
- Multilingual assistant: EN/HI/ES/MR/TE/FR with external KB training
- Accessibility & UX: draggable SOS and AI Assistant, improved marquee/spacing

## Tech Stack
- Web (project/): React 18, TypeScript 5, Vite 7, Tailwind CSS, framer-motion, Leaflet, axios, Firebase SDK
- Backend (backend/): Node.js, Express 5, CORS, body-parser, Firebase SDK
- Mobile (cityconnect-mobile/): Expo SDK 53, React Native 0.79, React 19, React Navigation 7
- Native/Wrapper: Capacitor 7 with Android project
- Tooling: ESLint 9, TypeScript, PostCSS, Autoprefixer

## Repository Layout
```
cityconnect/
├─ project/               # Web app (Vite + React + TS)
├─ backend/               # Express API + assistant KB
├─ cityconnect-mobile/    # Expo React Native app
├─ android/               # Capacitor Android project
└─ ...                    # Configs (ngrok, capacitor)
```

## Getting Started
Prerequisites: Node.js LTS, npm, (optional) Android SDK, (optional) Expo CLI.

1) Start the backend API
```bash
cd backend
npm install
npm run start
# Server: http://localhost:4000
```

2) Start the web app
```bash
cd ../project
npm install
npm run dev
# Vite dev server will print the local URL
```

3) (Optional) Run the mobile app with Expo
```bash
cd ../cityconnect-mobile
npm install
npm run start
```

## Configuration
- API base URL: the web app reads `VITE_API_BASE` if set. Example:
```bash
# in project/
VITE_API_BASE=http://localhost:4000 npm run dev
```
- Firebase: the SDK is available in web/mobile; ensure your Firebase config is supplied where required for auth/RTDB features.

## Security

CityConnect implements comprehensive security measures:

- **Environment Variables**: Sensitive data (API keys, tokens) stored in `.env` files (not committed)
- **Input Validation**: All API endpoints validate and sanitize user input
- **Rate Limiting**: Protection against DoS attacks (100 req/15min per IP)
- **XSS Protection**: HTML sanitization to prevent cross-site scripting
- **NoSQL Injection Protection**: Input sanitization for database queries
- **Security Headers**: Helmet.js for secure HTTP headers
- **Role-Based Access Control**: Protected endpoints for sensitive operations

### Setup for Development

1. **Backend Environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Frontend Environment**:
   ```bash
   cd project
   cp .env.example .env
   # Add your Firebase configuration
   ```

3. **ngrok (optional)**:
   ```bash
   cp ngrok.yml.example ngrok.yml
   # Add your ngrok authtoken
   ```

**Important**: Never commit `.env` files or `ngrok.yml` to version control.

For more details, see [SECURITY.md](./SECURITY.md).

## Assistant: Training & Knowledge Base
The assistant supports an external JSON knowledge base at `backend/assistant/kb.json`. You can teach it at runtime via REST endpoints (no redeploy needed).

- List KB items
```bash
curl -s http://localhost:4000/api/assistant/kb
```

- Upsert a KB topic (regex patterns + localized answers)
```bash
curl -s -X POST http://localhost:4000/api/assistant/kb \
  -H 'Content-Type: application/json' \
  -d '{
    "topic": "dashboard_citizen",
    "patterns": ["^what is the citizen dashboard$", "citizen dashboard|user dashboard"],
    "answers": {"en": "Citizen dashboard overview..."}
  }'
```

- Quick teach a single Q/A (exact-match style; stored under a topic)
```bash
curl -s -X POST http://localhost:4000/api/assistant/teach \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "how do i earn points",
    "answer": "Earn points by reporting issues, voting, and daily tasks.",
    "language": "en",
    "topic": "gamification_faq"
  }'
```

Unknown user queries are logged to `backend/assistant/unknown.log` to help you identify gaps.

## Scripts
- Root: `npm run dev|build|preview|lint` (delegates to `project/`)
- Backend: `npm run start` (Express), `npm run dev` (nodemon)
- Mobile: `npm run start|android|ios|web` (Expo)

## Troubleshooting
- If the web dev server exits early, ensure dependencies are installed in `project/` and Node.js is up to date.
- If the web app cannot reach the API, set `VITE_API_BASE` to your backend URL.
- CORS: enabled for all origins by default in the backend.

## License
This repository does not include a license by default. Add one if you plan to distribute.
# haavi
# TeamHaavi
# TeamHaavi
