# CityConnect Web (Vite + React)

This project is the web (Capacitor) frontend of CityConnect. It now includes scaffolding for advanced smart-city features:

## Implemented Scaffolding & Features

### Core
- Capacitor + Android integration (web assets built from `project/dist`)
- Firebase Auth + Realtime Database + (Gradle) Firestore/Analytics dependencies
- Native + Web Google Sign-In integration (via `@codetrix-studio/capacitor-google-auth`)
- Role-based dashboards (Citizen, Authority, Professional)
- Issue reporting with GPS auto-fill and reverse geocoding
- Notification overlay with backdrop & accessibility improvements

### Newly Added Feature Scaffolds
- Gamification System:
  - `GamificationContext` manages points, levels, badges, and event history.
  - Rules in `services/gamification/rules.ts` (events: ISSUE_REPORTED, FIRST_REPORT, etc.).
  - Automatically awards points when a user submits an issue; first report bonus.
- AI Assistant Stub:
  - `services/ai/assistant.ts` with `askAssistant(prompt, history, options, onToken)` mock streaming logic.
- Sentiment Analysis Heuristic:
  - `services/ai/sentiment.ts` simple keyword-based polarity score.
- Vision Classification Stub:
  - `services/ai/vision.ts` mock classifier returning pseudo-random labels.
- Transport Optimization:
  - `services/transport/optimizer.ts` returns dynamic route suggestions.
  - `TransportContext` periodically refreshes suggestions (2 min interval).
- Internationalization (i18n) Locale Context:
  - `LocaleContext` + `useLocale` with English (en) and Spanish (es) sample keys.
  - Persistent language preference in `localStorage`.

## File Map (Key Additions)
- `src/contexts/gamification/GamificationContext.tsx`
- `src/contexts/gamification/useGamification.ts`
- `src/services/gamification/rules.ts`
- `src/services/ai/assistant.ts`
- `src/services/ai/sentiment.ts`
- `src/services/ai/vision.ts`
- `src/services/transport/optimizer.ts`
- `src/contexts/transport/TransportContext.tsx`
- `src/contexts/transport/useTransport.ts`
- `src/contexts/locale/LocaleContext.tsx`
- `src/contexts/locale/useLocale.ts`
- `src/pages/ReportIssue.tsx` (integrated points awarding)
- `src/App.tsx` (providers wired)

## Provider Composition Order
```
<AuthProvider>
  <UserProvider>
    <LocaleProvider>
      <GamificationProvider>
        <TransportProvider>
          <NotificationProvider>
            <LocationProvider>
              <Router />
            </LocationProvider>
          </NotificationProvider>
        </TransportProvider>
      </GamificationProvider>
    </LocaleProvider>
  </UserProvider>
</AuthProvider>
```

## Extending the Gamification System
1. Add new event key to `GamificationEvent` union in `rules.ts`.
2. Assign points in `EVENT_POINTS` map.
3. Trigger `awardEvent('NEW_EVENT', metadata)` from relevant component.
4. (Optional) Adjust badge thresholds or level curve.

## Integrating Real AI Backends
Replace stubs with API calls:
- Assistant: call backend `/api/assistant` streaming endpoint.
- Sentiment: use ML model or external NLP API.
- Vision: upload image to backend for inference (e.g., TensorFlow Serving / Vision API).
- Transport: integrate real-time feeds (GTFS-RT) + optimization engine / graph algorithms.

## Localization (i18n)
Use the hook:
```tsx
import { useLocale } from '@/contexts/locale/useLocale';
const { t, locale, setLocale } = useLocale();
return <h1>{t('issue.report.title')}</h1>;
```
Add new keys to `RESOURCES` for each language. Avoid hardcoding user-facing strings; migrate gradually.

## Development Scripts
```bash
# Install deps
npm install
# Run dev
npm run dev
# Build web assets (used by Capacitor Android)
npm run build
```
Ensure you then run:
```bash
npx cap sync android
```
And rebuild the native project in Android Studio or via Gradle.

## Future Roadmap (Suggested)
- Persistent leaderboard & badge history (sync with Firestore)
- Real LLM assistant with context grounding (recent issues, user history)
- Image moderation & damage severity scoring
- Route suggestion UI component (surface `TransportContext` data)
- Push notifications integration for status changes
- Offline-first caching layer for issues & gamification
- Accessibility: dynamic language switching on UI

## Troubleshooting
| Area | Symptom | Tip |
|------|---------|-----|
| Capacitor Assets | Android shows blank/placeholder | Run `npm run build` then `npx cap sync android` |
| Google Sign-In | Native plugin error | Confirm `@codetrix-studio/capacitor-google-auth` installed & configured |
| Points Not Updating | No increase after event | Ensure provider wraps component tree & event name matches union |

## License
MIT

## Contributing
PRs welcome for production-grade AI integrations, improved heuristics, and accessibility/i18n enhancements.
