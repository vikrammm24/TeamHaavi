import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, HashRouter, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import LandingPage from './pages/LandingPage';
import { PageTransition } from './components/ui/PageTransition';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ReportIssue from './pages/ReportIssue';
import ProjectBoard from './pages/ProjectBoard';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import MyReports from './pages/MyReports';
import Messages from './pages/Messages';
import Features from './pages/Features';
import SelectRole from './pages/SelectRole';
import Signup from './pages/Signup';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LocationProvider } from './components/RealtimeLocation';
import LocationPrompt from './components/LocationPrompt';
import { AuthProvider } from './contexts/authContext';
import { GamificationProvider } from './contexts/gamification/GamificationContext';
import { LocaleProvider } from './contexts/locale/LocaleContext';
import { TransportProvider } from './contexts/transport/TransportContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading CityConnect...</h2>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <UserProvider>
        <LocaleProvider>
          <GamificationProvider>
            <TransportProvider>
              <NotificationProvider>
                <LocationProvider>
            {(Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.location.protocol === 'file:')) ? (
              <HashRouter>
                <div className="App">
                  <LocationPrompt />
                  <ErrorBoundary>
                  <PageTransition>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/select-role" element={<SelectRole />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      {/* Role shortcut routes */}
                      <Route path="/login/citizen" element={<Navigate to="/login?mode=login&role=citizen" replace />} />
                      <Route path="/login/professional" element={<Navigate to="/login?mode=login&role=professional" replace />} />
                      <Route path="/login/authority" element={<Navigate to="/login?mode=login&role=authority" replace />} />
                      <Route path="/signup/citizen" element={<Navigate to="/login?mode=signup&role=citizen" replace />} />
                      <Route path="/signup/professional" element={<Navigate to="/login?mode=signup&role=professional" replace />} />
                      <Route path="/signup/authority" element={<Navigate to="/login?mode=signup&role=authority" replace />} />
                      <Route path="/home" element={<Navigate to="/citizen-dashboard" replace />} />
                      <Route path="/citizen-dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
                      <Route path="/authority-dashboard" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
                      <Route path="/professional-dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
                      <Route path="/report-issue" element={<ReportIssue />} />
                      <Route path="/project-board" element={<ProjectBoard />} />
                      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </PageTransition>
                  </ErrorBoundary>
                </div>
              </HashRouter>
            ) : (
              <BrowserRouter>
              <div className="App">
                <LocationPrompt />
                <ErrorBoundary>
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/select-role" element={<SelectRole />} />
                       <Route path="/login" element={<Login />} />
                       <Route path="/signup" element={<Signup />} />
                      {/* Role shortcut routes */}
                      <Route path="/login/citizen" element={<Navigate to="/login?mode=login&role=citizen" replace />} />
                      <Route path="/login/professional" element={<Navigate to="/login?mode=login&role=professional" replace />} />
                      <Route path="/login/authority" element={<Navigate to="/login?mode=login&role=authority" replace />} />
                      <Route path="/signup/citizen" element={<Navigate to="/login?mode=signup&role=citizen" replace />} />
                      <Route path="/signup/professional" element={<Navigate to="/login?mode=signup&role=professional" replace />} />
                      <Route path="/signup/authority" element={<Navigate to="/login?mode=signup&role=authority" replace />} />
                    <Route path="/home" element={<Navigate to="/citizen-dashboard" replace />} />
                    <Route path="/citizen-dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
                    <Route path="/authority-dashboard" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
                    <Route path="/professional-dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
                    <Route path="/report-issue" element={<ReportIssue />} />
                    <Route path="/project-board" element={<ProjectBoard />} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </PageTransition>
                </ErrorBoundary>
              </div>
              </BrowserRouter>
            )}
                </LocationProvider>
              </NotificationProvider>
            </TransportProvider>
          </GamificationProvider>
        </LocaleProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;