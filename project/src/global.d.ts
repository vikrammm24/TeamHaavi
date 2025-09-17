// Global module declarations for JS/TS interop

declare module '../components/TransportSuggestions' {
  import * as React from 'react';
  const C: React.FC;
  export default C;
}

declare module '../components/firebase/firebase' {
  import type { Auth } from 'firebase/auth';
  import type { Analytics } from 'firebase/analytics';
  import type { Firestore } from 'firebase/firestore';
  import type { Database } from 'firebase/database';
  import type { FirebaseApp } from 'firebase/app';
  export const auth: Auth;
  export const analytics: Analytics | null;
  export const app: FirebaseApp;
  export const db: Firestore;
  export const rtdb: Database;
}

declare module '../components/firebase/auth' {
  interface FirebaseUser { uid: string; email?: string | null; displayName?: string | null }
  interface UserCredential { user: FirebaseUser }
  interface UserProfile { uid: string; email?: string | null; displayName?: string | null; role?: string }
  export const doCreateUserWithEmailAndPassword: (email:string, password:string)=>Promise<UserCredential>;
  export const doSignInWithEmailAndPassword: (email:string, password:string)=>Promise<UserCredential>;
  export const doSignInWithGoogle: ()=>Promise<UserCredential>;
  export const doSignUpWithGoogle: ()=>Promise<UserCredential>;
  export const doSignOut: ()=>Promise<void>;
  export const doPasswordReset: (email:string)=>Promise<void>;
  export const doPasswordChange: (password:string)=>Promise<void>;
  export const doSendEmailVerification: ()=>Promise<void>;
  export const getUserProfile: (uid:string)=>Promise<UserProfile | null>;
  export const setUserProfile: (uid:string, data:Partial<UserProfile>)=>Promise<void>;
}
