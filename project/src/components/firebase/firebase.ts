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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGS5bCBo8PVkqHKJjbg7ZvSDhDyVltIlk",
  authDomain: "cityconnect-471e9.firebaseapp.com",
  databaseURL:
    "https://cityconnect-471e9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cityconnect-471e9",
  storageBucket: "cityconnect-471e9.appspot.com",
  messagingSenderId: "470221584396",
  appId: "1:470221584396:web:e8ca9c60603d0a664e5629",
  measurementId: "G-KFFV10KV82",
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
