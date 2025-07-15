import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Zap, 
  Brain, 
  Trophy, 
  Users, 
  Target,
  Sparkles,
  Crown,
  Shield,
  Sword
} from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const funFacts = [
    "Did you know? The word 'debate' comes from the Latin 'de-' (down) + 'battuere' (to beat).",
    "The longest recorded debate lasted 57 hours and 9 minutes!",
    "Ancient Greeks considered debate essential for democracy.",
    "The first televised presidential debate was in 1960 between Kennedy and Nixon.",
    "Debate skills are linked to improved critical thinking and public speaking."
  ];

  const quickActions = [
    {
      title: 'Find a Debate',
      description: 'Challenge opponents and climb the rankings',
      icon: Target,
      color: 'from-blue-500 to-indigo-600',
      href: '/find-debate',
      emoji: '⚔️'
    },
    {
      title: 'Practice Mode',
      description: 'Hone your skills against AI opponents',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      href: '/practice',
      emoji: '🧠'
    },
    {
      title: 'View Leaderboard',
      description: 'See where you rank among champions',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-600',
      href: '/leaderboard',
      emoji: '🏆'
    },
    {
      title: 'Go Home',
      description: 'Return to the main arena',
      icon: Home,
      color: 'from-green-500 to-teal-600',
      href: '/',
      emoji: '🏠'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-6xl opacity-10"
          >
            ⚔️
          </motion.div>
          <motion.div
            animate={{ y: [0, 40, 0], rotate: [0, -12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-20 text-5xl opacity-10"
          >
            🎯
          </motion.div>
          <motion.div
            animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-20 text-4xl opacity-10"
          >
            🧠
          </motion.div>
          <motion.div
            animate={{ y: [0, 35, 0], x: [0, -25, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 text-5xl opacity-10"
          >
            ⚡
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* 404 Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-9xl font-black text-white mb-6"
            >
              404
            </motion.div>
            
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <Search className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              <span className="block">Oops! This Debate</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                Doesn't Exist
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              Looks like this debate topic got lost in the arena. But don't worry - there are thousands of other exciting topics waiting for you!
            </p>
          </motion.div>

          {/* Fun Facts Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Fun Debate Facts</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {funFacts.map((fact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl opacity-60">
                        {index === 0 && '💡'}
                        {index === 1 && '⏰'}
                        {index === 2 && '🏛️'}
                        {index === 3 && '📺'}
                        {index === 4 && '🧠'}
                      </div>
                      <p className="text-blue-100 text-sm leading-relaxed">{fact}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">What Would You Like to Do?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                  >
                    <Link
                      to={action.href}
                      className="block bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                          className="text-2xl"
                        >
                          {action.emoji}
                        </motion.div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                        {action.title}
                      </h3>
                      
                      <p className="text-blue-200 text-sm group-hover:text-blue-100 transition-colors">
                        {action.description}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>
            
            <Link
              to="/"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default NotFoundPage;
