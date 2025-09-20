import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  Bell,
  Settings,
  Plus,
  BarChart3,
  Users,
  Briefcase,
  MessageSquare,
  Building,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';
import ErrorBoundary from './ErrorBoundary';
import AssistantWidget from './AssistantWidget';
import { useGamification } from '../contexts/gamification/useGamification';

// Add a prop for AI analytics widgets
export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  sidebarType?: 'citizen' | 'authority' | 'professional';
  hideSidebar?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, sidebarType, hideSidebar = false }) => {
  // Navigation handled via NavLink/Link
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { points, level, badge } = useGamification();
  const nextLevelAt = level * 100;
  const currentLevelBase = (level - 1) * 100;
  const progressPct = Math.min(100, Math.max(0, Math.round(((points - currentLevelBase) / (nextLevelAt - currentLevelBase)) * 100)));

  const getNavigationItems = () => {
    const type = sidebarType ?? user?.role ?? 'professional';
    if (type === 'citizen') {
      return [
        { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
        { name: 'Citizen Dashboard', icon: <Users className="w-5 h-5" />, path: '/citizen-dashboard' },
        { name: 'Report Issue', icon: <Plus className="w-5 h-5" />, path: '/report-issue' },
        { name: 'My Reports', icon: <BarChart3 className="w-5 h-5" />, path: '/my-reports' },
        { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
      ];
    } else if (type === 'authority') {
      return [
        { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
        { name: 'Progress', icon: <BarChart3 className="w-5 h-5" />, path: '/authority-dashboard?section=progress' },
        { name: 'Recent Issues', icon: <AlertTriangle className="w-5 h-5" />, path: '/authority-dashboard?section=recent-issues' },
        { name: 'Professionals', icon: <Briefcase className="w-5 h-5" />, path: '/authority-professionals' },
        { name: 'Map', icon: <MapPin className="w-5 h-5" />, path: '/map' },
        { name: 'Citizens', icon: <Users className="w-5 h-5" />, path: '/citizens' },
      ];
    } else {
      // Professional sidebar: Professional Dashboard, My Jobs, Applied Jobs, Settings
      return [
        { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
        { name: 'Professional Dashboard', icon: <Building className="w-5 h-5" />, path: '/professional-dashboard' },
        { name: 'My Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/active-jobs' },
        { name: 'Applied Jobs', icon: <BarChart3 className="w-5 h-5" />, path: '/my-jobs' },
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isItemActive = (path: string) => {
    try {
      const url = new URL(path, 'http://dummy');
      const targetPath = url.pathname;
      if (targetPath === '/authority-dashboard') {
        const targetSection = url.searchParams.get('section') || '';
        const current = new URLSearchParams(location.search).get('section') || '';
        return location.pathname === targetPath && current === targetSection;
      }
      return location.pathname === targetPath;
    } catch {
      return location.pathname === path;
    }
  };

  return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <AnimatePresence>
          {!hideSidebar && (isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-lg"
            >
              <div className="flex flex-col h-full">
                {/* Logo/Header */}
                <div className="flex items-center justify-center h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                  <h1 className="text-xl font-bold text-white">CityConnect</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSidebarOpen(false);
                        try {
                          navigate(item.path);
                        } catch {
                          try {
                            window.location.href = item.path;
                          } catch {}
                        }
                      }}
                      className={() => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isItemActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  ))}
                </nav>

                {/* User section */}
                <div className="px-4 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role || 'Role'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <LogOutIcon className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white shadow-sm border-b px-6 py-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                {!hideSidebar && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <MenuIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Home button */}
                <Link
                  to="/"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                  title="Go to Home"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Home className="w-5 h-5" />
                </Link>

                {/* Page title */}
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Compact Level Widget */}
                <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 bg-white">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Level</div>
                    <div className="text-sm font-semibold text-gray-800">{level}</div>
                  </div>
                  <div className="w-28">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-blue-600" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">{points} pts{badge ? ` • ${badge}` : ''}</div>
                  </div>
                </div>
                {/* Notifications */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || 'Role'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.header>
          {/* Page Content with error boundary */}
          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </motion.div>
          </main>
        </div>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {!hideSidebar && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </AnimatePresence>

        <AssistantWidget />
      </div>
  );
};

export default DashboardLayout;