import { Capacitor } from '../../shims/capacitor-core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth';
import { auth } from './firebase';

// Initialize plugin lazily (Codetrix auto-init on web; on native we just ensure it's ready)
let initialized = false;
export function isNativeGoogleAvailable(): boolean {
  try {
    const hasNative = Capacitor.isNativePlatform?.() ?? false;
    const hasMethod = typeof (GoogleAuth as any)?.signIn === 'function';
    return !!(hasNative && hasMethod);
  } catch {
    return false;
  }
}

async function ensureInit(webClientId?: string) {
  if (initialized) return;
  if (isNativeGoogleAvailable()) {
    try {
      if (webClientId) {
        await GoogleAuth.initialize({
          clientId: webClientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } else {
        // Initialize with defaults. On Android, plugin can use default_web_client_id from resources.
        const minimalInit: { scopes: string[]; grantOfflineAccess: boolean } = {
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        };
        await GoogleAuth.initialize(minimalInit as unknown as { clientId?: string; scopes: string[]; grantOfflineAccess: boolean });
      }
    } catch {
      // ignore re-init errors (already initialized)
    }
  }
  initialized = true;
}

interface GoogleSignInResult {
  authentication?: { idToken?: string };
  idToken?: string; // some plugin versions expose idToken at root
}

export async function nativeGoogleSignIn(webClientId?: string): Promise<UserCredential> {
  if (!isNativeGoogleAvailable()) {
    throw new Error('Native GoogleAuth plugin not available');
  }
  await ensureInit(webClientId);
  // Force account chooser every time
  try { await GoogleAuth.signOut(); } catch { /* ignore */ }
  const res = (await GoogleAuth.signIn()) as unknown as GoogleSignInResult;
  const idToken = res?.authentication?.idToken || res?.idToken; // plugin versions differ
  if (!idToken) throw new Error('No idToken returned from native Google Sign-In');
  const cred = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, cred);
}

export async function nativeGoogleSignOut() {
  try { await GoogleAuth.signOut(); } catch { /* ignore */ }
}
