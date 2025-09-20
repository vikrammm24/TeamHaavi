import React, { useEffect, useState } from "react";
import { auth } from "../../components/firebase/firebase.ts";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doSignInWithEmailAndPassword } from "../../components/firebase/auth";

type AuthValue = {
  user: User | null;
  userLoggedIn: boolean;
  loading: boolean;
};

const AuthContext = React.createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core auth state subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserLoggedIn(true);
      } else {
        setUser(null);
        setUserLoggedIn(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Optional auto-login once per session
  useEffect(() => {
    // Run only on first mount and only if not logged in
    if (auth.currentUser) return;
    try {
      // Avoid re-running within the same tab session
      const already = sessionStorage.getItem('cc:autoLogin:done');
      if (already) return;
      sessionStorage.setItem('cc:autoLogin:done', '1');
    } catch {}

    const email = (import.meta?.env?.VITE_AUTO_LOGIN_EMAIL || localStorage.getItem('cc:autoLogin:email') || '').trim();
    const password = (import.meta?.env?.VITE_AUTO_LOGIN_PASSWORD || localStorage.getItem('cc:autoLogin:password') || '').trim();
    if (!email || !password) return;

    (async () => {
      try {
        await doSignInWithEmailAndPassword(email, password);
        // onAuthStateChanged will update state
      } catch {
        // Silent fail - don't block app
      }
    })();
  }, []);

  const value: AuthValue = {
    user,
    userLoggedIn,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
