import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Sun, 
  Moon, 
  Trophy,
  TrendingUp,
  Sparkles,
  Home
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const Header: React.FC = () => {
  const { user, signOut, isAuthenticated, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  // Navigation items - different for landing vs authenticated pages
  const navigation = isAuthenticated 
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
        { name: 'Find Debate', href: '/find-debate', icon: Trophy },
        { name: 'Practice', href: '/practice', icon: User },
        { name: 'History', href: '/history', icon: TrendingUp },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }
      ]
    : [
        { name: 'Features', href: '/features', icon: Sparkles },
        { name: 'About', href: '/about', icon: Home },
      ];

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const userMenu = document.querySelector('.user-menu');
      const userButton = document.querySelector('.user-button');
      
      if (isUserMenuOpen && userMenu && !userMenu.contains(target) && !userButton?.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    // Handle scroll effect for landing page
    const handleScroll = () => {
      if (isLandingPage) {
        setIsScrolled(window.scrollY > 20);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    if (isLandingPage) {
      window.addEventListener('scroll', handleScroll);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (isLandingPage) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLandingPage, isUserMenuOpen]);

  // Check for dark mode on mount and when it changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Header background classes based on page and scroll state
  const getHeaderClasses = () => {
    if (isLandingPage) {
      return isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg'
        : 'bg-transparent';
    }
    return 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm';
  };

  // Text color classes based on page, scroll state, and theme
  const getTextClasses = () => {
    if (isLandingPage && !isScrolled) {
      return isDarkMode ? 'text-white' : 'text-gray-900';
    }
    return 'text-gray-900 dark:text-white';
  };

  const getHoverClasses = () => {
    if (isLandingPage && !isScrolled) {
      return 'hover:text-blue-200';
    }
    return 'hover:text-blue-600 dark:hover:text-blue-400';
  };

  // Subtitle color classes
  const getSubtitleClasses = () => {
    if (isLandingPage && !isScrolled) {
      return isDarkMode ? 'text-blue-200' : 'text-blue-600';
    }
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${getHeaderClasses()}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <img 
                src="/logo-light.png" 
                alt="Debattle Logo" 
                className="w-10 h-10 rounded-xl shadow-lg bg-white transition-transform duration-200 group-hover:scale-105" 
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Debattle
              </span>
              <span className={`text-xs font-medium transition-colors duration-200 ${getSubtitleClasses()}`}>
                The Arena of Ideas
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : `${getTextClasses()} ${getHoverClasses()}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${getTextClasses()} hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="user-button flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <img
                      src={user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                      alt={user?.displayName}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
                      {user?.displayName}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="user-menu absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.displayName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to={`/profile/${user?.uid}`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="w-4 h-4"
                />
                Sign in
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : `${getTextClasses()} ${getHoverClasses()}`
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
