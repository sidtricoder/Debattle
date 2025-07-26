import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatLoadingAnimation } from '../components/animations/ChatLoadingAnimation';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  Brain, 
  Crown, 
  Star, 
  ArrowRight, 
  Calendar,
  Clock,
  Award,
  Flame,
  Sparkles,
  Shield,
  Sword
} from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';

import { AnimatedCounter } from '../components/animations/AnimatedCounter';
import { firestore } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Footer from '../components/layout/Footer';
// 1. Import Recharts
// If not installed, run: npm install recharts
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Model() {
  const gltf = useLoader(GLTFLoader, '/model1.glb');
  return <primitive object={gltf.scene} scale={2} />;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDebates: 0,
    winRate: 0,
    totalWins: 0,
    totalDraws: 0,
    totalLosses: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [ratingHistory, setRatingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        // Fetch user stats directly from users collection
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let wins = 0, losses = 0, draws = 0, gamesPlayed = 0;
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          wins = userData.wins || 0;
          losses = userData.losses || 0;
          draws = userData.draws || 0;
          gamesPlayed = userData.gamesPlayed || 0;
        }
        const totalDebates = gamesPlayed;
        const winRate = totalDebates > 0 ? Math.round((wins / totalDebates) * 100) : 0;
        setStats({
          totalDebates,
          winRate,
          totalWins: wins,
          totalDraws: draws,
          totalLosses: losses
        });

        // Fetch all recent debates and filter in JS for user participation
        const debatesSnapshot = await getDocs(query(
          collection(firestore, 'debates'),
          orderBy('createdAt', 'desc'),
          limit(30)
        ));
        const debates: any[] = debatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Current user UID:', user.uid);
        console.log('Raw debates:', debates);
        // Filter debates for user participation
        const userDebates = debates.filter(d =>
          Array.isArray(d.participants) && d.participants.some((p: any) => p.userId === user.uid)
        );
        // Reconstruct rating history from debates (match HistoryPage logic)
        const history = userDebates
          .map(d => {
            // Use endedAt if available, else createdAt
            let date = d.endedAt || d.createdAt;
            if (date?.toDate) date = date.toDate();
            else if (typeof date === 'string') date = new Date(date);
            else if (typeof date === 'number') date = new Date(date);
            // Get rating after debate for user
            const rating = d.ratings && d.ratings[user.uid] !== undefined ? d.ratings[user.uid] : null;
            return {
              date,  // Keep as Date object for sorting
              displayDate: date ? date.toLocaleDateString() : '',
              rating
            };
          })
          .filter(d => d.rating !== null)
          .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by Date objects
          .slice(-20) // last 20 points
          .map(item => ({
            date: item.displayDate, // Convert to display format after sorting
            rating: item.rating
          }));
        
        setRatingHistory(history);

        // Fetch recent activity (optional, can keep as is)
        const activityQuery = query(
          collection(firestore, 'debates'),
          where('participants', 'array-contains', { userId: user.uid }),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const activitySnapshot = await getDocs(activityQuery);
        const activity = activitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentActivity(activity);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.uid]); // Removed refreshUserData from dependencies

  const getTierInfo = (rating: number) => {
    if (rating >= 2000) return { name: 'Diamond', color: 'from-blue-400 to-indigo-500', icon: Crown };
    if (rating >= 1800) return { name: 'Platinum', color: 'from-gray-400 to-gray-600', icon: Star };
    if (rating >= 1600) return { name: 'Gold', color: 'from-yellow-400 to-orange-500', icon: Trophy };
    if (rating >= 1400) return { name: 'Silver', color: 'from-gray-300 to-gray-500', icon: Shield };
    if (rating >= 1200) return { name: 'Bronze', color: 'from-orange-600 to-red-600', icon: Flame };
    return { name: 'Iron', color: 'from-gray-600 to-gray-800', icon: Sword };
  };

  const tierInfo = getTierInfo(user?.rating || 1200);
  const TierIcon = tierInfo.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
        <ChatLoadingAnimation 
          message="Loading your dashboard..." 
          className="py-20"
        />
      </div>
    );
  }

  console.log('Rating history data:', ratingHistory);

  return (
    <>
      {/* 3D Model Viewer at top right, not sticky, with margin */}
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent dark:from-black/30"></div>
          <div className="relative z-10 container mx-auto px-6 py-14">
            <div className="flex flex-row items-center justify-between gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-4 mb-6 justify-start">
                  <div className={`w-16 h-16 bg-gradient-to-r ${tierInfo.color} rounded-2xl flex items-center justify-center shadow-xl border-4 border-white/20`}>
                    <TierIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
                      Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-400 dark:to-orange-300">{user?.displayName || 'Champion'}</span>!
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 font-medium dark:text-blue-200">
                      {tierInfo.name} Tier • ELO <span className="font-bold">{user?.rating || 1200}</span>
                    </p>
                  </div>
                </div>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl font-light dark:text-blue-300">
                  Ready to dominate the arena? Your opponents are waiting for a worthy challenge.
                </p>
              </motion.div>
              <div className="w-80 h-80 flex-shrink-0">
                <Canvas camera={{ position: [5, 0, 9], fov: 50 }}>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 5, 5]} intensity={0.7} />
                  <Suspense fallback={null}>
                    <Stage environment={null} intensity={0.5}>
                      <Model />
                    </Stage>
                    <OrbitControls enableZoom={false} enablePan={false} />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-6 -mt-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                title: 'Total Debates',
                value: stats.totalDebates,
                icon: Sword,
                color: 'from-blue-500 to-indigo-600',
                bgColor: 'from-blue-50 to-indigo-50',
                borderColor: 'border-blue-200'
              },
              {
                title: 'Total Wins',
                value: stats.totalWins,
                icon: Crown,
                color: 'from-purple-500 to-indigo-600',
                bgColor: 'from-purple-50 to-indigo-50',
                borderColor: 'border-purple-200'
              },
              {
                title: 'Total Draws',
                value: stats.totalDraws,
                icon: Award,
                color: 'from-gray-400 to-gray-600',
                bgColor: 'from-gray-50 to-gray-200',
                borderColor: 'border-gray-200'
              },
              {
                title: 'Total Losses',
                value: stats.totalLosses,
                icon: Flame,
                color: 'from-red-500 to-pink-600',
                bgColor: 'from-red-50 to-pink-50',
                borderColor: 'border-red-200'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className={`rounded-2xl p-7 transition-all duration-300 flex flex-col gap-2`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center border-2 border-white/30`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* Rotating icon removed */}
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1 tracking-wide dark:text-gray-200">{stat.title}</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {typeof stat.value === 'number' ? (
                      <AnimatedCounter value={stat.value} />
                    ) : (
                      stat.value
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl p-8 dark:bg-transparent">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 tracking-tight dark:text-gray-100">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    Quick Actions
                  </h2>
                  {/* Rotating icon removed */}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
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
                      title: 'View History',
                      description: 'Review your past debates and performance',
                      icon: Clock,
                      color: 'from-green-500 to-teal-600',
                      href: '/history',
                      emoji: '📊'
                    },
                    {
                      title: 'Leaderboard',
                      description: 'See where you rank among champions',
                      icon: Trophy,
                      color: 'from-yellow-500 to-orange-600',
                      href: '/leaderboard',
                      emoji: '🏆'
                    }
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        className=""
                      >
                        <Link
                          to={action.href}
                          className="block rounded-xl p-6 transition-all duration-300 group dark:bg-transparent"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-md`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            {/* Rotating icon removed */}
                          </div>
                          <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors tracking-wide dark:text-gray-100 dark:group-hover:text-blue-400">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 mb-3 text-sm dark:text-gray-300">{action.description}</p>
                          <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors text-sm dark:text-blue-400 dark:group-hover:text-blue-300">
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Rating Graph Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rating History</h2>
                {ratingHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No rating history available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={ratingHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-8"
            >
              {/* Recent Activity - hidden as per request */}
              {/*
              <div className="rounded-2xl p-6 dark:bg-transparent">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 tracking-tight dark:text-gray-100">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </h2>
                </div>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                          <Sword className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate dark:text-gray-100">
                            {activity.topic?.substring(0, 30)}...
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.createdAt?.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {activity.status}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <div className="text-3xl mb-2">📊</div>
                      <p>No recent activity</p>
                      <p className="text-xs">Start debating to see your activity here!</p>
                    </div>
                  )}
                </div>
              </div>
              */}

              {/* Profile Stats */}
              <div className="rounded-2xl p-6 dark:bg-transparent">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 tracking-tight dark:text-gray-100">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Your Stats
                  </h2>
                  {/* Rotating icon removed */}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm dark:text-gray-300">Debates Won</span>
                    <span className="font-bold text-gray-800 dark:text-white">{stats.totalWins}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm dark:text-gray-300">Debates Drawn</span>
                    <span className="font-bold text-gray-800 dark:text-white">{stats.totalDraws}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm dark:text-gray-300">Debates Lost</span>
                    <span className="font-bold text-gray-800 dark:text-white">{stats.totalLosses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm dark:text-gray-300">Win Rate</span>
                    <span className="font-bold text-gray-800 dark:text-white">{stats.winRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm dark:text-gray-300">ELO Rating</span>
                    <span className="font-bold text-gray-800 dark:text-white">{user?.rating || 1200}</span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="mt-6"
                >
                  <Link
                    to={`/profile/${user?.uid}`}
                    className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 text-sm dark:from-purple-700 dark:to-indigo-800 dark:hover:from-purple-800 dark:hover:to-indigo-900"
                  >
                    View Full Profile
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
