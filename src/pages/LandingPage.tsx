import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Trophy, Brain, Zap, Play, TrendingUp, Globe, Target, Star, Sparkles, Crown, Shield, Award } from 'lucide-react';
import { firestore } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../components/auth/AuthProvider';
import AnimatedWaveBackground from '../../animated-wave-background';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

type FAQ = {
  question: string;
  answer: string;
};

interface FAQStepperProps {
  faqs: FAQ[];
}

const FAQS = [
  {
    question: "How do I get started with Debattle?",
    answer: "Simply sign up for a free account, set up your profile, and join a live debate or practice session instantly."
  },
  {
    question: "Is Debattle suitable for all experience levels?",
    answer: "Absolutely! Whether you're a beginner or a seasoned debater, our platform offers tailored experiences and AI-powered feedback for everyone."
  },
  {
    question: "Can I track my progress and stats?",
    answer: "Yes, your debate history, ELO rating, and achievements are all tracked in your personal dashboard."
  },
  {
    question: "How does AI judging work?",
    answer: "Our advanced AI analyzes arguments for clarity, logic, and persuasiveness, providing instant, unbiased feedback after each debate."
  },
];

const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [liveDebates, setLiveDebates] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch live debates count
        const debatesQuery = query(
          collection(firestore, 'debates'),
          where('status', '==', 'active')
        );
        const debatesSnapshot = await getDocs(debatesQuery);
        setLiveDebates(debatesSnapshot.size);

        // Fetch total users count
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        setTotalUsers(usersSnapshot.size);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback values
        setLiveDebates(1247);
        setTotalUsers(50000);
      }
    };

    fetchStats();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Matchmaking",
      description: "Find your perfect debate opponent in under 10 seconds",
      details: "Our advanced algorithm analyzes your skill level, debate preferences, and topic interests to connect you with the perfect opponent instantly.",
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Judging",
      description: "Get instant, unbiased feedback on your arguments",
      details: "Our AI evaluates your arguments for clarity, logic, and persuasiveness, providing detailed feedback to help you improve your debate skills.",
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-600 to-pink-600"
    },
    {
      icon: Trophy,
      title: "ELO Rating System",
      description: "Climb from Bronze to Diamond like a chess grandmaster",
      details: "Track your progress with our competitive ranking system. Win debates to climb the leaderboard and earn prestigious ranks and achievements.",
      gradient: "from-green-400 to-teal-500",
      bgGradient: "from-green-600 to-teal-600"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Debate with brilliant minds from 50+ countries",
      details: "Join a diverse community of thinkers and speakers from around the world. Learn different perspectives and debate styles from various cultures.",
      gradient: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-600 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden snap-y snap-mandatory">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-40 flex flex-col md:flex-row items-center justify-between gap-12 min-h-[calc(100vh-4rem)] snap-start">
        {/* Left Side: Hero Text, Stats, Features */}
        <div className="flex-1 flex flex-col items-start justify-center text-left">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-300 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              Master the Art
              <br />
              of Debate
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl leading-relaxed"
            >
              Join thousands of debaters worldwide and unlock your full potential as a communicator and critical thinker. Debattle empowers you to challenge worthy opponents, sharpen your reasoning, and climb the ELO rankings in the <span className="text-blue-600 font-semibold">Chess.com of debating</span>. Experience lightning-fast matchmaking, AI-powered judging, and a vibrant global community—all designed to help you master the art of debate and become a leader in the arena of ideas.
            </motion.p>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            {isAuthenticated ? (
              <Link
                to="/find-debate"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-lg"
              >
                <Sparkles className="w-5 h-5" />
                Find Debate
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Debating
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center gap-3 text-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-8"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[180px]">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers.toLocaleString()}</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Total Users</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[180px]">
              <Trophy className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{liveDebates.toLocaleString()}</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Live Debates</div>
            </div>
          </motion.div> */}
        </div>
        
        {/* Right Side: Image */}
        <div className="flex-1 flex items-center justify-center your-div" style={{ marginTop: '-3rem', border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent' }}>
          <motion.img 
            src="/debattle.png" 
            alt="Debate Illustration" 
            className="max-w-2xl w-full h-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.08 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>

      <style>
        {`
          .flip-card {
            perspective: 1000px;
            height: 320px;
            width: 288px;
          }
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }
          .flip-card:hover .flip-card-inner {
            transform: rotateY(180deg);
          }
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 1rem;
            padding: 2rem;
            box-sizing: border-box;
          }
          .flip-card-back {
            transform: rotateY(180deg);
          }
        `}
      </style>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm snap-start">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Debattle?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven debate methodologies to create a personalized, competitive experience.
            </p>
          </motion.div>
          
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flip-card rounded-2xl cursor-pointer mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
              >
                <div className="flip-card-inner rounded-2xl">
                  {/* Front of the card */}
                  <div className={`flip-card-front bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center h-full`}>
                    <feature.icon className={`w-12 h-12 mb-4 ${feature.gradient.replace('to-', 'text-')}`} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center mt-4">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Back of the card */}
                  <div className={`flip-card-back bg-gradient-to-br ${feature.bgGradient} dark:opacity-90 rounded-2xl p-8 shadow-xl shadow-black/10 dark:shadow-black/20 border border-white/10 flex flex-col items-center justify-center h-full`}>
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-white/90 leading-relaxed text-center">
                      {feature.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="relative z-10 py-32 px-2 md:px-0 snap-start bg-transparent"
      >
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center bg-gradient-to-b from-blue-700 to-cyan-400 bg-clip-text text-transparent dark:from-cyan-200 dark:to-blue-400">Frequently Asked Questions</h2>
          <FAQStepper faqs={FAQS} />
        </div>
      </section>

      {/* Footer */}
      <div className="snap-end">
        <Footer />
      </div>
      {/* Animated SVG Wave Background */}
      <AnimatedWaveBackground position="bottom" />
    </div>
  );
};

// FAQStepper component
function FAQStepper({ faqs }: FAQStepperProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = React.useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top + window.scrollY;
      const stepHeight = 320; // px per FAQ step
      const scrollY = window.scrollY + windowHeight / 2;
      const progress = Math.max(0, scrollY - sectionTop);
      const idx = Math.min(faqs.length - 1, Math.floor(progress / stepHeight));
      setActiveIdx(idx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, [faqs.length]);

  return (
    <div ref={sectionRef} className="relative min-h-[950px] flex flex-col gap-16">
      {faqs.map((faq: FAQ, idx: number) => {
        const isActive = idx === activeIdx;
        return (
          <div key={idx} className="flex flex-col md:flex-row items-center justify-between min-h-[160px] w-full">
            {/* Question Card */}
            <motion.div
              className="w-full md:w-[48%] mb-4 md:mb-0 rounded-[2rem] shadow-2xl p-6 md:p-8 bg-white/90 dark:bg-gray-900/90"
              initial={false}
              animate={isActive ? { opacity: 1, x: 0, rotate: -3 } : { opacity: 0, x: -120, rotate: -8 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              style={{
                zIndex: 2,
                boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.18)',
              }}
            >
              <span className="block font-bold text-blue-700 dark:text-cyan-300 mb-2">Question:</span>
              <span className="text-lg text-gray-900 dark:text-white font-sans">{faq.question}</span>
            </motion.div>
            {/* Answer Card */}
            <motion.div
              className="w-full md:w-[48%] rounded-[2rem] shadow-2xl p-6 md:p-8 bg-blue-700 dark:bg-cyan-800 text-white"
              initial={false}
              animate={isActive ? { opacity: 1, x: 0, rotate: 4 } : { opacity: 0, x: 120, rotate: 8 }}
              transition={{ duration: 0.7, ease: 'easeInOut', delay: isActive ? 0.18 : 0 }}
              style={{
                zIndex: 1,
                boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.18)',
              }}
            >
              <span className="block font-bold mb-2 text-cyan-100 dark:text-cyan-200">Answer:</span>
              <span className="text-lg font-sans">{faq.answer}</span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export default LandingPage;
