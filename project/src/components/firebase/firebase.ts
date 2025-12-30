// Firebase core setup (TypeScript)
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  Auth,
} from "firebase/auth";
import { browserPopupRedirectResolver } from "firebase/auth";
import { cordovaPopupRedirectResolver } from "firebase/auth/cordova";
import { Capacitor } from '@capacitor/core';
import { getAnalytics, Analytics } from "firebase/analytics";
import { initializeFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGS5bCBo8PVkqHKJjbg7ZvSDhDyVltIlk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cityconnect-471e9.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://cityconnect-471e9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cityconnect-471e9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cityconnect-471e9.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "470221584396",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:470221584396:web:e8ca9c60603d0a664e5629",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KFFV10KV82",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
// Initialize Auth with robust persistence and the right resolver for native/file scheme
const isNativeLike = (Capacitor?.isNativePlatform?.() ?? false) || (typeof window !== 'undefined' && window.location.protocol === 'file:');
const resolver = isNativeLike ? cordovaPopupRedirectResolver : browserPopupRedirectResolver;
const auth: Auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
  popupRedirectResolver: resolver,
});
// Use long polling so Firestore works behind strict proxies/ISPs
const db: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
// Initialize Realtime Database
const rtdb: Database = getDatabase(app);
let analytics: Analytics | null = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch {
  // Ignore analytics initialization errors
}

export { auth, analytics, app, db, rtdb };
