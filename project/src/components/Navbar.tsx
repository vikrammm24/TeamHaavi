import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User, LogIn, Home, Users, Building, Shield, Brain, CreditCard, Camera, CheckCircle, MessageSquare, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>(() => (localStorage.getItem('cc-theme') as 'light'|'dark') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
    localStorage.setItem('cc-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Citizen Dashboard', path: '/citizen-dashboard', icon: Users },
    { name: 'Professional Dashboard', path: '/professional-dashboard', icon: Building },
  { name: 'Authority Dashboard', path: '/authority-dashboard', icon: Shield },
  { name: 'Leaderboard', path: '/leaderboard', icon: Users },
  ];

  const featureItems = [
    { name: 'AI Matching & Analytics', path: '/authority-dashboard#ai', icon: Brain },
    { name: 'Blockchain Payments', path: '/authority-dashboard#blockchain', icon: CreditCard },
    { name: 'Sensors & CCTV', path: '/authority-dashboard#sensors', icon: Camera },
    { name: 'Verification', path: '/authority-dashboard#verification', icon: CheckCircle },
    { name: 'Engagement', path: '/authority-dashboard#engagement', icon: MessageSquare },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-glass shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
  <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 brand-icon rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">CC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                City<span className="" style={{ color: 'var(--bg2)' }}>Connect</span>
              </span>
              <span className="text-xs text-gray-500 -mt-1">Smart City Platform</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Main Navigation */}
            <div className="flex items-center gap-6">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.a
                    key={item.name}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    whileHover={{ y: -2 }}
                    className={`cc-nav-link flex items-center gap-2 text-gray-700 hover-brand font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover-brand-bg ${isActive ? 'cc-nav-link-active' : ''}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon className="w-4 h-4 text-brand" />
                    <span>{item.name}</span>
                  </motion.a>
                );
              })}
            </div>

            {/* Features Dropdown */}
            <div className="relative group">
              <motion.button
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 text-gray-700 hover-brand font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover-brand-bg"
              >
                <Brain className="w-4 h-4 text-brand" />
                <span>Features</span>
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4"
                >
                  ▼
                </motion.div>
              </motion.button>

              {/* Features Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  {featureItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={item.name}
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.path);
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover-brand hover-brand-bg transition-colors duration-300 cc-nav-link"
                      >
                        <Icon className="w-4 h-4 text-brand" />
                        <span className="text-sm">{item.name}</span>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ rotate: 20 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/40 hover:bg-white/80 dark:hover:bg-white/20 transition-colors"
            >
              {theme === 'light' ? (
                <span className="text-xs font-semibold">🌙</span>
              ) : (
                <span className="text-xs font-semibold">☀️</span>
              )}
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 text-gray-700 dark:text-gray-300 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 rounded-full"
                aria-label="Open notifications"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full brand-icon text-white shadow-sm">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                </span>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[1.1rem] h-5 px-1.5 flex items-center justify-center shadow-sm"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notification Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="hidden md:block font-medium text-gray-700">{user.name}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2"
                      >
                        <button
                          onClick={() => {
                            const dashboardPath = user.role === 'citizen' ? '/citizen-dashboard' :
                                                user.role === 'authority' ? '/authority-dashboard' :
                                                '/professional-dashboard';
                            navigate(dashboardPath);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors duration-300"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/select-role')}
                className="text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--bg3), var(--bg1))' }}
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:block">Sign In</span>
              </motion.button>
            )}

            {/* Mobile Menu Button */}
              <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover-brand transition-colors duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              {/* Main Navigation */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2">Main Navigation</h3>
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 py-2 px-2 text-gray-700 hover-brand font-medium transition-colors duration-300 cc-nav-link"
                    >
                      <Icon className="w-4 h-4 text-brand" />
                      <span>{item.name}</span>
                    </motion.a>
                  );
                })}
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2">Features</h3>
                {featureItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + navItems.length) * 0.1 }}
                      className="flex items-center space-x-3 py-2 px-2 text-gray-700 hover-brand font-medium transition-colors duration-300 cc-nav-link"
                    >
                      <Icon className="w-4 h-4 text-brand" />
                      <span>{item.name}</span>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;