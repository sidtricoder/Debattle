import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Zap, Brain, Trophy, Users, Star, Crown } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-5xl opacity-10"
          >
            ⚔️
          </motion.div>
          <motion.div
            animate={{ y: [0, 35, 0], rotate: [0, -12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-20 text-6xl opacity-10"
          >
            🏆
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-20 text-4xl opacity-10"
          >
            🧠
          </motion.div>
          <motion.div
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 text-5xl opacity-10"
          >
            ⚡
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">⚔️</span>
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Debattle
              </span>
              <div className="text-xs text-blue-300 font-medium">The Arena of Ideas</div>
            </div>
          </Link>
          
          <Link
            to="/login"
            className="text-white/90 hover:text-white transition-colors font-medium flex items-center gap-2"
          >
            <span>Already have an account?</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </motion.div>
          </Link>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Register Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <Crown className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Elite</span>!
                  </h1>
                  <p className="text-xl text-blue-200">
                    Your journey to becoming a debate champion starts here. Ready to dominate the arena?
                  </p>
                </motion.div>

                <RegisterForm onSwitchToLogin={() => window.location.href = '/login'} />
              </div>
            </motion.div>

            {/* Right Side - Benefits & Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="order-1 lg:order-2"
            >
              <div className="space-y-8">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center lg:text-left"
                >
                  <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                    <span className="block">Become a</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                      Debate Master
                    </span>
                  </h2>
                  <p className="text-xl text-blue-200 mb-8 leading-relaxed">
                    Join thousands of debaters worldwide and start your journey to becoming a champion. Your first victory awaits!
                  </p>
                </motion.div>

                {/* Benefits Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {[
                    {
                      icon: Zap,
                      title: "Lightning-Fast Setup",
                      description: "Get started in under 30 seconds",
                      gradient: "from-yellow-400 to-orange-500"
                    },
                    {
                      icon: Brain,
                      title: "AI-Powered Learning",
                      description: "Get instant feedback on your arguments",
                      gradient: "from-purple-400 to-pink-500"
                    },
                    {
                      icon: Trophy,
                      title: "Competitive Rankings",
                      description: "Climb from Bronze to Diamond",
                      gradient: "from-green-400 to-teal-500"
                    },
                    {
                      icon: Users,
                      title: "Global Community",
                      description: "Debate with champions worldwide",
                      gradient: "from-blue-400 to-indigo-500"
                    }
                  ].map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                        <p className="text-blue-200 text-sm">{benefit.description}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Testimonials */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
                >
                  <h3 className="text-xl font-bold text-white mb-4 text-center">What Champions Say</h3>
                  <div className="space-y-4">
                    {[
                      {
                        quote: "Debattle transformed my argument skills. I went from Bronze to Diamond in just 3 months!",
                        author: "Sarah M.",
                        rating: 5
                      },
                      {
                        quote: "The AI feedback is incredible. I've improved my logic score by 40% since joining.",
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
                      <div className="text-blue-200 text-sm">Active Debaters</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">100K+</div>
                      <div className="text-blue-200 text-sm">Debates Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">95%</div>
                      <div className="text-blue-200 text-sm">Satisfaction Rate</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="relative z-10 container mx-auto px-6 py-12"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-blue-200 mb-6">
              Join thousands of debaters and start improving your skills today. Your first victory awaits!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Create Your Account
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
