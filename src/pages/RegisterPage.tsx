import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Brain, Award, Users, Lock, BarChart, BookOpen, Star } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
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

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Debattle
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">The Platform for Thoughtful Discussion</div>
            </div>
          </Link>
          
          <Link
            to="/login"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium flex items-center gap-2"
          >
            <span>Already have an account?</span>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow hover:shadow-md"
            >
              Sign In
            </motion.div>
          </Link>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Divider for mobile */}
          <div className="lg:hidden w-full h-px bg-gray-200 dark:bg-gray-700 my-8"></div>
          
          {/* Left Side - Register Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Create Your Account
                </h1>
                <p className="text-gray-700 dark:text-blue-200 mb-6">
                  Join our community of thoughtful debaters and critical thinkers today.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      form.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Create Your Account
                </motion.button>
              </motion.div>

              <RegisterForm onSwitchToLogin={() => navigate('/login')} />
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
                  <span className="block">Join Our</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
                    Community
                  </span>
                </h2>
                <p className="text-gray-700 dark:text-blue-200 mb-8 leading-relaxed">
                  Connect with like-minded individuals and engage in meaningful discussions on important topics.
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
                    icon: Lock,
                    title: "Secure Platform",
                    description: "Your data and privacy are protected",
                    color: "text-blue-400 dark:text-blue-600"
                  },
                  {
                    icon: Brain,
                    title: "Critical Thinking",
                    description: "Develop your analytical skills",
                    color: "text-purple-400 dark:text-purple-600"
                  },
                  {
                    icon: Award,
                    title: "Achievement",
                    description: "Track your progress and growth",
                    color: "text-yellow-400 dark:text-yellow-600"
                  },
                  {
                    icon: Users,
                    title: "Network",
                    description: "Connect with professionals",
                    color: "text-green-400 dark:text-green-600"
                  },
                  {
                    icon: BarChart,
                    title: "Analytics",
                    description: "Understand your discussion style",
                    color: "text-red-400 dark:text-red-600"
                  },
                  {
                    icon: BookOpen,
                    title: "Knowledge Base",
                    description: "Access educational resources",
                    color: "text-indigo-400 dark:text-indigo-600"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="p-6 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-xl border border-gray-200/20 dark:border-gray-700/50"
                  >
                    <div className={`w-10 h-10 rounded-lg ${feature.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Testimonials */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">What Our Users Say</h3>
                <div className="space-y-4">
                  {[
                    {
                      quote: "This platform has transformed the way I think about complex topics. The discussions are incredibly insightful.",
                      author: "Sarah M.",
                      rating: 5
                    },
                    {
                      quote: "The quality of discourse here is exceptional. I've learned so much from engaging with this community.",
                      author: "Alex K.",
                      rating: 5
                    }
                  ].map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 1.6 + index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-blue-200 text-sm italic mb-2">"{testimonial.quote}"</p>
                      <p className="text-white font-semibold text-sm">- {testimonial.author}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">50K+</div>
                    <div className="text-blue-200 text-sm">Active Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">100K+</div>
                    <div className="text-blue-200 text-sm">Discussions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">95%</div>
                    <div className="text-blue-200 text-sm">Satisfaction</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-gradient-to-r from-blue-400/20 to-blue-600/20 dark:from-blue-600/20 dark:to-blue-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/20 dark:border-white/20 shadow-2xl max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-700 dark:text-blue-200 mb-6">
              Join our community of thoughtful debaters and critical thinkers today.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  form.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Create Your Account
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
