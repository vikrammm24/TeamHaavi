import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus,
  BarChart3,
  Users,
  Briefcase,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';
import AssistantWidget from './AssistantWidget';

// Add a prop for AI analytics widgets
export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  aiAnalyticsWidget?: React.ReactNode; // Placeholder for AI analytics
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, aiAnalyticsWidget }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { unreadCount } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { 
        name: 'Dashboard', 
        icon: <Home className="w-5 h-5" />, 
        path: user?.role === 'citizen' ? '/citizen-dashboard' :
              user?.role === 'authority' ? '/authority-dashboard' :
              '/professional-dashboard'
      },
      { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
      { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
    ];

    if (user?.role === 'citizen') {
      return [
        ...baseItems.slice(0, 1),
        { name: 'Report Issue', icon: <Plus className="w-5 h-5" />, path: '/report-issue' },
        { name: 'My Reports', icon: <BarChart3 className="w-5 h-5" />, path: '/my-reports' },
        ...baseItems.slice(1)
      ];
    } else if (user?.role === 'authority') {
      return [
        ...baseItems.slice(0, 1),
        { name: 'All Issues', icon: <BarChart3 className="w-5 h-5" />, path: '/all-issues' },
        { name: 'Citizens', icon: <Users className="w-5 h-5" />, path: '/citizens' },
        { name: 'Map View', icon: <MapPin className="w-5 h-5" />, path: '/map' },
        ...baseItems.slice(1)
      ];
    } else {
      return [
        ...baseItems.slice(0, 1),
        { name: 'Project Board', icon: <Briefcase className="w-5 h-5" />, path: '/project-board' },
        { name: 'My Jobs', icon: <BarChart3 className="w-5 h-5" />, path: '/my-jobs' },
        ...baseItems.slice(1)
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-lg"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CC</span>
                  </div>
                  <span className="text-xl font-bold">
                    City<span className="text-green-500">Connect</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{user?.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => {
                            navigate(item.path);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon}
                          <span className="font-medium">{item.name}</span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
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
          className="bg-glass shadow-sm border-b px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
              >
                <Menu className="w-6 h-6" />
              </button>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
                  {title}
                  {/* Back to Home */}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md border border-transparent bg-white/60 hover:bg-white hover:border-blue-200 shadow-sm transition-colors duration-200"
                    title="Go to Home"
                  >
                    <Home className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline text-blue-700">Home</span>
                  </button>
                </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationPanel onClose={() => setShowNotifications(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar -> clickable for settings/profile */}
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:opacity-90"
                title="Profile & Settings"
              >
                <User className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      <AssistantWidget />
    </div>
  );
};

export default DashboardLayout;