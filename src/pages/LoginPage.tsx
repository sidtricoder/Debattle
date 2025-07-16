import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Brain, Trophy } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent to-transparent text-gray-900 dark:text-white overflow-hidden relative">
      {/* Animated Background Elements - Very subtle */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => {
          const bgColor = isDarkMode ? 'bg-blue-500/3' : 'bg-blue-100/10';
          return (
            <motion.div
              key={i}
              className={`absolute rounded-full ${bgColor}`}
              style={{
                width: Math.random() * 400 + 200,
                height: Math.random() * 400 + 200,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(60px)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: isDarkMode ? [0.03, 0.05, 0.03] : [0.01, 0.02, 0.01],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Divider for mobile */}
          <div className="lg:hidden w-full h-px bg-gray-200 dark:bg-gray-700 my-8"></div>
          {/* Left Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome Back
                </h1>
                <p className="text-gray-700 dark:text-blue-200">
                  Sign in to access your account
                </p>
              </motion.div>

              <LoginForm 
                onSwitchToRegister={() => navigate('/register')}
                onForgotPassword={() => navigate('/forgot-password')}
              />
            </div>
          </motion.div>

          {/* Vertical Divider for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
          
          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="order-1 lg:order-2 lg:pl-12"
          >
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center lg:text-left"
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  <span className="block">Get Started</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
                    With Debattle
                  </span>
                </h2>
                <p className="text-gray-700 dark:text-blue-200 mb-8 leading-relaxed">
                  Access your personalized dashboard and continue your work.
                </p>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {[
                  {
                    icon: Brain,
                    title: "Smart Insights",
                    description: "Get detailed analysis of your performance",
                    color: "text-blue-400 dark:text-blue-600"
                  },
                  {
                    icon: Shield,
                    title: "Secure Platform",
                    description: "Your data is always protected",
                    color: "text-green-400 dark:text-green-600"
                  },
                  {
                    icon: Trophy,
                    title: "Track Progress",
                    description: "Monitor your improvement over time",
                    color: "text-yellow-400 dark:text-yellow-600"
                  },
                  {
                    icon: Brain,
                    title: "Learn & Grow",
                    description: "Access educational resources",
                    color: "text-purple-400 dark:text-purple-600"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="p-6 hover:bg-white/5 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-lg ${feature.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Divider */}
      <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mt-12"></div>
    </div>
  );
};

export default LoginPage;
