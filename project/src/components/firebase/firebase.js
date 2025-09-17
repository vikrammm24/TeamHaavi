// Lightweight JS proxy that re-exports typed firebase.ts (kept for legacy imports)
import { auth, analytics, app, db, rtdb } from './firebase.ts';

export { auth, analytics, app, db, rtdb };