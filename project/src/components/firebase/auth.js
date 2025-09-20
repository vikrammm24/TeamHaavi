import { auth, db } from "./firebase";
import { Capacitor } from '../../shims/capacitor-core';
import { nativeGoogleSignIn, nativeGoogleSignOut, isNativeGoogleAvailable } from './googleNative';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

// Helper to normalize Firestore offline error
const isOfflineError = (err) => {
  const msg = String(err?.message || '').toLowerCase();
  return err?.code === 'unavailable' || msg.includes('offline') || msg.includes('failed to get document');
};

// Upsert user profile in Firestore
async function upsertUser(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(ref);
    const base = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      providerId: user.providerData?.[0]?.providerId || "password",
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await updateDoc(ref, base);
    }
  } catch (err) {
    if (!isOfflineError(err)) {
      throw err;
    }
  }
}

// Create user with email/password
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await upsertUser(cred.user);
  return cred;
};

// Sign in with email/password
export const doSignInWithEmailAndPassword = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await upsertUser(cred.user);
  return cred;
};

// Sign in with Google popup (LOGIN path)
export const doSignInWithGoogle = async () => {
  // Determine environment
  const isNative = Capacitor.isNativePlatform();
  const webClientId = (import.meta?.env?.VITE_GOOGLE_WEB_CLIENT_ID || '').trim();
  let result;
  if (isNative && isNativeGoogleAvailable()) {
    result = await nativeGoogleSignIn(webClientId || undefined);
  } else {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      // Try redirect result first (in case we returned from a previous redirect)
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        result = redirectResult;
      } else {
        // Try popup first
        result = await signInWithPopup(auth, provider);
      }
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      // Fallback to redirect if popup blocked or storage partitioning prevents popup flow
      // if (msg.includes('popup') || msg.includes('third-party') || msg.includes('blocked')) {
      //   // Preserve intent
      //   try { sessionStorage.setItem('cc:google:mode', 'login'); } catch {}
      //   await signInWithRedirect(auth, provider);
      //   // This will navigate away; return a pending promise to avoid further processing
      //   return new Promise(() => {});
      // }
      throw e;
    }
  }
  const ref = doc(db, "users", result.user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // Auto-create profile if missing
      await setDoc(ref, {
        uid: result.user.uid,
        email: result.user.email || null,
        displayName: result.user.displayName || null,
        photoURL: result.user.photoURL || null,
        providerId: result.user.providerData?.[0]?.providerId || "google.com",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        email: result.user.email || null,
        displayName: result.user.displayName || null,
        photoURL: result.user.photoURL || null,
        providerId: result.user.providerData?.[0]?.providerId || "google.com",
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    if (!isOfflineError(err)) {
      throw err;
    }
  }
  return result;
};

// Sign up with Google popup (SIGN-UP path – allows creating a profile)
export const doSignUpWithGoogle = async () => {
  const isNative = Capacitor.isNativePlatform();
  const webClientId = (import.meta?.env?.VITE_GOOGLE_WEB_CLIENT_ID || '').trim();
  let result;
  if (isNative && isNativeGoogleAvailable()) {
    result = await nativeGoogleSignIn(webClientId || undefined);
  } else {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        result = redirectResult;
      } else {
        result = await signInWithPopup(auth, provider);
      }
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      // if (msg.includes('popup') || msg.includes('third-party') || msg.includes('blocked')) {
      //   try { sessionStorage.setItem('cc:google:mode', 'signup'); } catch {}
      //   await signInWithRedirect(auth, provider);
      //   return new Promise(() => {});
      // }
      throw e;
    }
  }
  await upsertUser(result.user);
  return result;
};

// Optional helpers
export const doSignOut = async () => {
  if (Capacitor.isNativePlatform()) {
    await nativeGoogleSignOut();
  }
  return signOut(auth);
};
export const doPasswordReset = (email) => sendPasswordResetEmail(auth, email);
export const doPasswordChange = (password) => updatePassword(auth.currentUser, password);
export const doSendEmailVerification = () => sendEmailVerification(auth.currentUser);

// Profile helpers
export const getUserProfile = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const setUserProfile = async (uid, data) => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};