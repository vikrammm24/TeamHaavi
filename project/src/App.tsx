import { useState, useEffect, lazy, Suspense } from 'react';
import ARReport from './components/ui/ARReport';
import SafeRouteFinder from './components/ui/SafeRouteFinder';
import { Routes, Route, BrowserRouter, HashRouter, Navigate } from 'react-router-dom';
import { Capacitor } from './shims/capacitor-core';
const LandingPage = lazy(() => import('./pages/LandingPage'));
import { PageTransition } from './components/ui/PageTransition';
const Login = lazy(() => import('./pages/Login'));
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard'));
const AuthorityDashboard = lazy(() => import('./pages/AuthorityDashboard'));
const ProfessionalDashboard = lazy(() => import('./pages/ProfessionalDashboard'));
const ReportIssue = lazy(() => import('./pages/ReportIssue'));
const ProjectBoard = lazy(() => import('./pages/ProjectBoard'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Settings = lazy(() => import('./pages/Settings'));
const MyReports = lazy(() => import('./pages/MyReports'));
const AllIssues = lazy(() => import('./pages/AllIssues'));
const Citizens = lazy(() => import('./pages/Citizens'));
const Map = lazy(() => import('./pages/Map'));
const MyJobs = lazy(() => import('./pages/MyJobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const JobApplication = lazy(() => import('./pages/JobApplication'));
const ActiveJobs = lazy(() => import('./pages/ActiveJobs'));
const CompletedJobs = lazy(() => import('./pages/CompletedJobs'));
const Ratings = lazy(() => import('./pages/Ratings'));
const ResponseTime = lazy(() => import('./pages/ResponseTime'));
const Messages = lazy(() => import('./pages/Messages'));
const Features = lazy(() => import('./pages/Features'));
const SelectRole = lazy(() => import('./pages/SelectRole'));
const Signup = lazy(() => import('./pages/Signup'));
const ForCitizens = lazy(() => import('./pages/ForCitizens'));
const ForProfessionals = lazy(() => import('./pages/ForProfessionals'));
const ForAuthorities = lazy(() => import('./pages/ForAuthorities'));
const AuthorityProfessionals = lazy(() => import('./pages/AuthorityProfessionals'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Contact = lazy(() => import('./pages/Contact'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));
const CommunityGuidelines = lazy(() => import('./pages/CommunityGuidelines'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Press = lazy(() => import('./pages/Press'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const LiveSOSMap = lazy(() => import('./pages/LiveSOSMap'));
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
import GlobalFloaters from './components/GlobalFloaters';
import { ToastProvider } from './components/ui/ToastProvider';
import DailyLoginAward from './components/gamification/DailyLoginAward';
// Impact and Demo pages (added below)
const Impact = lazy(() => import('./pages/Impact'));
const DemoGuide = lazy(() => import('./pages/DemoGuide'));

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
                <ToastProvider>
                  <LocationProvider>
                    <DailyLoginAward />
            {(Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.location.protocol === 'file:')) ? (
              <HashRouter>
                <div className="App" id="main" role="main">
                  <LocationPrompt />
                  <ErrorBoundary>
                  <PageTransition>
                    <Suspense fallback={<div className="p-6">Loading…</div>}>
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
                        <Route path="/ar-report" element={<ARReport />} />
                        <Route path="/safe-route-finder" element={<SafeRouteFinder />} />
                      <Route path="/home" element={<Navigate to="/citizen-dashboard" replace />} />
                      <Route path="/citizen-dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
                      <Route path="/authority-dashboard" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
                      <Route path="/authority-professionals" element={<ProtectedRoute><AuthorityProfessionals /></ProtectedRoute>} />
                      <Route path="/professional-dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
                      <Route path="/report-issue" element={<ReportIssue />} />
                      <Route path="/project-board" element={<ProjectBoard />} />
                        <Route path="/all-issues" element={<ProtectedRoute><AllIssues /></ProtectedRoute>} />
                        <Route path="/citizens" element={<Citizens />} />
                        <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
                        <Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
                        <Route path="/job/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                        <Route path="/job/:jobId/apply" element={<ProtectedRoute><JobApplication /></ProtectedRoute>} />
                        <Route path="/active-jobs" element={<ProtectedRoute><ActiveJobs /></ProtectedRoute>} />
                        <Route path="/completed-jobs" element={<ProtectedRoute><CompletedJobs /></ProtectedRoute>} />
                        <Route path="/ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
                        <Route path="/response-time" element={<ProtectedRoute><ResponseTime /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                      <Route path="/impact" element={<Impact />} />
                      <Route path="/demo-guide" element={<DemoGuide />} />
                      {/* Footer-linked pages */}
                      <Route path="/for-citizens" element={<ForCitizens />} />
                      <Route path="/for-professionals" element={<ForProfessionals />} />
                      <Route path="/for-authorities" element={<ForAuthorities />} />
                      <Route path="/api-docs" element={<APIDocumentation />} />
                      <Route path="/help" element={<HelpCenter />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/status" element={<SystemStatus />} />
                      <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/press" element={<Press />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/sos/:uid" element={<LiveSOSMap />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </Suspense>
                  </PageTransition>
                  </ErrorBoundary>
                  <GlobalFloaters />
                </div>
              </HashRouter>
            ) : (
              <BrowserRouter>
              <div className="App" id="main" role="main">
                <LocationPrompt />
                <ErrorBoundary>
                <PageTransition>
                  <Suspense fallback={<div className="p-6">Loading…</div>}>
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
                    <Route path="/ar-report" element={<ARReport />} />
                    <Route path="/safe-route-finder" element={<SafeRouteFinder />} />
                    <Route path="/home" element={<Navigate to="/citizen-dashboard" replace />} />
                    <Route path="/citizen-dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
                    <Route path="/authority-dashboard" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
                    <Route path="/authority-professionals" element={<ProtectedRoute><AuthorityProfessionals /></ProtectedRoute>} />
                    <Route path="/professional-dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
                    <Route path="/report-issue" element={<ReportIssue />} />
                    <Route path="/all-issues" element={<ProtectedRoute><AllIssues /></ProtectedRoute>} />
                    <Route path="/citizens" element={<Citizens />} />
                    <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
                    <Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
                    <Route path="/job/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                    <Route path="/job/:jobId/apply" element={<ProtectedRoute><JobApplication /></ProtectedRoute>} />
                    <Route path="/active-jobs" element={<ProtectedRoute><ActiveJobs /></ProtectedRoute>} />
                    <Route path="/completed-jobs" element={<ProtectedRoute><CompletedJobs /></ProtectedRoute>} />
                    <Route path="/ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
                    <Route path="/response-time" element={<ProtectedRoute><ResponseTime /></ProtectedRoute>} />
                    <Route path="/project-board" element={<ProjectBoard />} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                    <Route path="/impact" element={<Impact />} />
                    <Route path="/demo-guide" element={<DemoGuide />} />
                    {/* Footer-linked pages */}
                    <Route path="/for-citizens" element={<ForCitizens />} />
                    <Route path="/for-professionals" element={<ForProfessionals />} />
                    <Route path="/for-authorities" element={<ForAuthorities />} />
                    <Route path="/api-docs" element={<APIDocumentation />} />
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/status" element={<SystemStatus />} />
                    <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/press" element={<Press />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/sos/:uid" element={<LiveSOSMap />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  </Suspense>
                </PageTransition>
                </ErrorBoundary>
                <GlobalFloaters />
              </div>
              </BrowserRouter>
            )}
                  </LocationProvider>
                </ToastProvider>
              </NotificationProvider>
            </TransportProvider>
          </GamificationProvider>
        </LocaleProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;