// Type declarations for firebase.js to satisfy TS compiler
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Firestore } from 'firebase/firestore';
import type { Database } from 'firebase/database';
import type { FirebaseApp } from 'firebase/app';

export const auth: Auth;
export const analytics: Analytics | null;
export const app: FirebaseApp; // Firebase application instance
export const db: Firestore;
export const rtdb: Database;
