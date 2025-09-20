import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { getAuth, getRedirectResult } from 'firebase/auth';
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignUpWithGoogle,
  getUserProfile,
  setUserProfile,
  doSignOut,
  doPasswordReset,
} from '../components/firebase/auth';

type Role = 'citizen' | 'authority' | 'professional';
interface FirebaseErrorLike { code?: string; message?: string }
interface UserProfile { uid: string; email?: string; displayName?: string; role?: Role }

const isOfflineError = (err: unknown): boolean => {
  const e = err as FirebaseErrorLike | undefined;
  const code = e?.code || '';
  const message = String(e?.message || '').toLowerCase();
  return code === 'unavailable' || code === 'auth/network-request-failed' || message.includes('offline') || message.includes('failed to get document');
};

const getFriendlyError = (err: unknown): string => {
  const e = err as FirebaseErrorLike | undefined;
  const code = e?.code || '';
  if (code === 'auth/email-already-in-use') return 'This email is already registered. Please Sign In.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') return 'Invalid email or password.';
  if (code === 'auth/weak-password') return 'Password is too weak. Use at least 6 characters.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/profile-not-found') return 'No profile found for this Google account. Please sign up first.';
  if (isOfflineError(err)) return "You're offline. Please check your connection and try again.";
  return `Firebase: ${e?.message || 'Request failed'}`;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const initialParams = new URLSearchParams(location.search);
  const initialRole = initialParams.get('role') as Role | null;
  const [isLogin, setIsLogin] = useState(initialParams.get('mode') !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: (initialRole && ['citizen','authority','professional'].includes(initialRole) ? initialRole : 'citizen') as Role,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>( 'idle');
  const [resetMsg, setResetMsg] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // If role is present in URL, lock it
  const roleLocked = !!(new URLSearchParams(location.search).get('role'));
  // Respond to URL changes (e.g., coming from Select Role)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const role = params.get('role') as Role | null;
    if (mode === 'signup') setIsLogin(false);
    if (mode === 'login') setIsLogin(true);
    if (role && ['citizen','authority','professional'].includes(role)) {
      setFormData(prev => ({ ...prev, role }));
    }
  }, [location.search]);

  // Handle Google redirect flow on mount (mobile browsers may force redirect)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Only treat redirect result errors as actionable if we previously intended a Google redirect
      let intendedGoogle = false;
      try { intendedGoogle = !!sessionStorage.getItem('cc:google:mode'); } catch {}
      try {
        const auth = getAuth();
        const rr = await getRedirectResult(auth);
        if (!rr || cancelled) return;
        const uid = rr.user.uid;
        // Determine mode we intended
        let mode: 'login' | 'signup' = 'login';
        try {
          const m = sessionStorage.getItem('cc:google:mode');
          if (m === 'signup') mode = 'signup';
          sessionStorage.removeItem('cc:google:mode');
        } catch {
          // Ignore storage access errors (e.g., privacy mode)
        }
        if (mode === 'login') {
          // Existing profile required
          let profile: UserProfile | null = null;
          try {
            profile = (await getUserProfile(uid)) as unknown as UserProfile | null;
          } catch (_pfErr: unknown) {
            if (isOfflineError(_pfErr)) {
              profile = {
                uid,
                email: rr.user.email || '',
                displayName: rr.user.displayName || rr.user.email || 'User',
                role: 'citizen',
              } as UserProfile;
            } else {
              await doSignOut();
              if (!cancelled) setError(getFriendlyError(_pfErr));
              return;
            }
          }
          if (!profile) {
            await doSignOut();
            if (!cancelled) setError('No profile found for this Google account. Please sign up first.');
            return;
          }
          login({ id: uid, name: profile.displayName || profile.email || 'User', email: profile.email || '', role: (profile.role || 'citizen') as Role });
          navigateByRole(profile.role);
        } else {
          // Sign-up: ensure profile exists/merge role
          try {
            await setUserProfile(uid, {
              uid,
              email: rr.user.email || formData.email,
              displayName: formData.name || rr.user.displayName || rr.user.email || 'User',
              role: formData.role,
            });
          } catch (pfErr: unknown) {
            if (!isOfflineError(pfErr)) throw pfErr;
          }
          let profile = (await getUserProfile(uid)) as unknown as UserProfile | null;
          if (!profile) {
            profile = {
              uid,
              email: rr.user.email || formData.email,
              displayName: formData.name || rr.user.displayName || rr.user.email || 'User',
              role: formData.role,
            } as UserProfile;
          }
          login({ id: uid, name: profile?.displayName || 'User', email: profile?.email || '', role: (profile?.role || 'citizen') as Role });
          navigateByRole(profile?.role);
        }
      } catch (e: unknown) {
        const err = e as { message?: string } | undefined;
        const msg = String(err?.message || '').toLowerCase();
        // If a Google redirect wasn't intended, ignore 'missing initial state' noise on page load
        if (msg.includes('missing initial state')) {
          if (intendedGoogle) {
            setError('Google sign-in was interrupted. Please try again. If it persists, switch off Private mode or use the app.');
          }
        } else {
          if (intendedGoogle) setError(getFriendlyError(e));
        }
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateByRole = (role?: string | null) => {
    switch (role) {
      case 'authority':
        navigate('/authority-dashboard');
        break;
      case 'professional':
        navigate('/professional-dashboard');
        break;
      default:
        navigate('/citizen-dashboard');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        // Email/password SIGN IN
        const cred = await doSignInWithEmailAndPassword(formData.email, formData.password);
        const uid = cred.user.uid;
        let profile: UserProfile | null = null;
        try {
          profile = (await getUserProfile(uid)) as unknown as UserProfile | null;
  } catch (pfErr: unknown) {
          // If offline or Firestore read blocked, fall back to a local profile
          profile = {
            uid,
            email: cred.user.email || '',
            displayName: cred.user.displayName || cred.user.email || 'User',
            role: 'citizen',
          } as UserProfile;
          // Try to upsert minimal profile; ignore errors (offline/rules)
          try {
            await setUserProfile(uid, profile as unknown as Record<string, unknown>);
          } catch (_e) {
            // Ignore profile upsert errors (offline or Firestore rules)
          }
        }
        if (!profile) {
          // Create minimal profile when missing
          profile = {
            uid,
            email: cred.user.email || formData.email,
            displayName: cred.user.displayName || cred.user.email || formData.email || 'User',
            role: 'citizen',
          } as UserProfile;
          try { await setUserProfile(uid, profile as unknown as Record<string, unknown>); } catch (_e) {
            // Ignore profile upsert errors (offline or Firestore rules)
          }
        }
        // Populate UI context regardless of Firestore state
        login({ id: uid, name: profile.displayName || profile.email || 'User', email: profile.email || '', role: (profile.role || 'citizen') as Role });
        navigateByRole(profile.role);
      } else {
        // Email/password SIGN UP
        const cred = await doCreateUserWithEmailAndPassword(formData.email, formData.password);
        const uid = cred.user.uid;
        // Best-effort profile write; never block auth on Firestore errors (rules/network)
        try {
          await setUserProfile(uid, {
            uid,
            email: formData.email,
            displayName: formData.name,
            role: formData.role,
          });
        } catch (pfErr: unknown) {
          // Ignore all profile write errors to ensure signup completes on mobile/webview
          try { console.warn('[signup] setUserProfile ignored error:', pfErr); } catch {}
        }
        // Populate UI context
        login({ id: uid, name: formData.name || formData.email, email: formData.email, role: formData.role });
        navigateByRole(formData.role);
      }
    } catch (err: unknown) {
      setError(getFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
    const result = await doSignInWithGoogle();
    const uid = result.user.uid;
  let profile: UserProfile | null = null;
    try {
  profile = (await getUserProfile(uid)) as unknown as UserProfile | null;
  } catch (pfErr: unknown) {
  if (isOfflineError(pfErr)) {
    const u = result.user;
    profile = {
    uid,
    email: u.email || '',
    displayName: u.displayName || u.email || 'User',
    role: 'citizen',
  } as UserProfile;
    } else {
    await doSignOut();
    setError(getFriendlyError(pfErr));
    return;
    }
    }
    if (!profile) {
    await doSignOut();
    setError('No profile found for this Google account. Please sign up first.');
    return;
    }
    login({ id: uid, name: profile.displayName || profile.email || 'User', email: profile.email || '', role: (profile.role || 'citizen') as Role });
    navigateByRole(profile.role);
    } catch (err: unknown) {
    setError(getFriendlyError(err));
    } finally {
    setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await doSignUpWithGoogle();
      const uid = result.user.uid;
      // Merge role/name; don't overwrite if already present
      try {
        await setUserProfile(uid, {
          uid,
          email: result.user.email || formData.email,
          displayName: formData.name || result.user.displayName || result.user.email || 'User',
          role: formData.role,
        });
      } catch (pfErr: unknown) {
        if (!isOfflineError(pfErr)) throw pfErr;
      }
      let profile: UserProfile | null = null;
      try {
        profile = (await getUserProfile(uid)) as unknown as UserProfile | null;
      } catch (pfErr: unknown) {
        if (!isOfflineError(pfErr)) throw pfErr;
      }
      if (!profile) {
        profile = {
          uid,
          email: result.user.email || formData.email,
          displayName: formData.name || result.user.displayName || result.user.email || 'User',
          role: formData.role,
        } as UserProfile;
      }
      login({ id: uid, name: profile?.displayName || 'User', email: profile?.email || '', role: (profile?.role || 'citizen') as Role });
      navigateByRole(profile?.role);
    } catch (err: unknown) {
      // Only sign out for non-offline errors
      if (!isOfflineError(err)) {
        await doSignOut();
      }
      setError(getFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white bg-opacity-10 rounded-full"
            style={{
              width: Math.random() * 300 + 100 + 'px',
              height: Math.random() * 300 + 100 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm relative z-10"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center mb-4"
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800">{isLogin ? 'Welcome Back' : 'Join CityConnect'}</h2>
            <p className="text-gray-600 mt-2">{isLogin ? 'Sign in to your account' : `Create your ${formData.role} account to get started`}</p>
          </motion.div>

          {/* Form */}
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-stretch w-full border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-300 bg-white">
                <span className="flex items-center pl-3 pr-2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-3 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Forgot Password Bar */}
              <div className="mt-2">
                <button
                  type="button"
                  disabled={resetStatus === 'sending'}
                  onClick={async () => {
                    setResetMsg('');
                    if (!formData.email) {
                      setResetStatus('error');
                      setResetMsg('Enter your email above first.');
                      return;
                    }
                    try {
                      setResetStatus('sending');
                      await doPasswordReset(formData.email);
                      setResetStatus('sent');
                      setResetMsg('Password reset email sent. Check your inbox.');
                    } catch {
                      setResetStatus('error');
                      setResetMsg('Could not send reset email.');
                    } finally {
                      setTimeout(() => setResetStatus('idle'), 4000);
                    }
                  }}
                  className={`w-full text-xs font-medium px-3 py-2 rounded-md border flex justify-between items-center transition-colors
                    ${resetStatus === 'sent' ? 'border-green-300 bg-green-50 text-green-700' : resetStatus === 'error' ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-blue-600 hover:bg-blue-50'}
                    disabled:opacity-60`}
                >
                  <span>{resetStatus === 'sent' ? 'Reset Email Sent' : 'Forgot Password?'}</span>
                  {resetStatus === 'sending' && (
                    <span className="ml-2 animate-pulse">...</span>
                  )}
                </button>
                {resetMsg && <div className="text-[10px] mt-1 text-gray-500">{resetMsg}</div>}
              </div>
            </motion.div>

            {!isLogin && !roleLocked && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="citizen">Citizen</option>
                  <option value="professional">Professional</option>
                  <option value="authority">City Authority</option>
                </select>
              </motion.div>
            )}
            {!isLogin && roleLocked && (
              <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                <span>Role: <strong className="capitalize">{formData.role}</strong></span>
                <button type="button" onClick={()=>navigate('/select-role')} className="text-blue-600 hover:underline text-xs">Change</button>
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: 0.7 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={isLogin ? handleGoogleSignIn : handleGoogleSignUp}
              disabled={isLoading}
              className="w-full mt-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </button>
          </motion.form>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 text-center">
            <div className="space-y-2">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    const next = !isLogin;
                    setIsLogin(next);
                    // Reflect new mode in the URL while preserving role
                    const params = new URLSearchParams(location.search);
                    params.set('mode', next ? 'login' : 'signup');
                    if (!params.get('role')) params.set('role', formData.role);
                    navigate({ pathname: '/login', search: params.toString() }, { replace: true });
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </motion.button>
              </p>
              <button
                type="button"
                onClick={()=>navigate('/select-role')}
                className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-4"
              >Choose a different role</button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
