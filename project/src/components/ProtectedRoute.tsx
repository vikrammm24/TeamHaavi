import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { auth } from "../components/firebase/firebase";
import { useUser } from "../contexts/UserContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

declare global {
  interface Window { __cc_pr_logged?: number }
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  const { isAuthenticated } = useUser();
  const hasSession = !!auth.currentUser;
  const allow = userLoggedIn || hasSession || isAuthenticated;

  // Lightweight diagnostics for mobile blank screen issue
  try {
    // Avoid spamming: only log a few times
    if (typeof window !== 'undefined') {
      window.__cc_pr_logged = window.__cc_pr_logged ?? 0;
      if ((window.__cc_pr_logged as number) < 10) {
        console.log('[ProtectedRoute]', { loading, userLoggedIn, hasSession, isAuthenticated, allow });
        window.__cc_pr_logged = (window.__cc_pr_logged as number) + 1;
      }
    }
  } catch {
    // ignore logging errors
  }

  if (loading && !hasSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!allow) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;