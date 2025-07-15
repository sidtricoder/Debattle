import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Model() {
  const gltf = useLoader(GLTFLoader, '/model1.glb');
  return <primitive object={gltf.scene} scale={2} />;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDebates: 0,
    winRate: 0,
    currentStreak: 0,
    totalWins: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        // Fetch user's debate statistics
        const debatesQuery = query(
          collection(firestore, 'debates'),
          where('participants', 'array-contains', { userId: user.uid }),
          orderBy('createdAt', 'desc')
        );
        const debatesSnapshot = await getDocs(debatesQuery);
        
        const userDebates = debatesSnapshot.docs.map(doc => doc.data());
        const totalDebates = userDebates.length;
        const wins = userDebates.filter(debate => 
          debate.judgment?.winner === user.uid
        ).length;
        const winRate = totalDebates > 0 ? Math.round((wins / totalDebates) * 100) : 0;

        // Calculate current streak (simplified)
        const currentStreak = Math.floor(Math.random() * 10) + 1; // Mock data for now

        setStats({
          totalDebates,
          winRate,
          currentStreak,
          totalWins: wins
        });

        // Fetch recent activity
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
  }, [user?.uid]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
                title: 'Win Rate',
                value: `${stats.winRate}%`,
                icon: Trophy,
                color: 'from-yellow-500 to-orange-600',
                bgColor: 'from-yellow-50 to-orange-50',
                borderColor: 'border-yellow-200'
              },
              {
                title: 'Current Streak',
                value: stats.currentStreak,
                icon: Flame,
                color: 'from-red-500 to-pink-600',
                bgColor: 'from-red-50 to-pink-50',
                borderColor: 'border-red-200'
              },
              {
                title: 'Total Wins',
                value: stats.totalWins,
                icon: Crown,
                color: 'from-purple-500 to-indigo-600',
                bgColor: 'from-purple-50 to-indigo-50',
                borderColor: 'border-purple-200'
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

              {/* Daily Challenges */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 dark:from-yellow-900 dark:to-orange-900 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 tracking-tight dark:text-gray-100">
                    <Award className="w-6 h-6 text-yellow-600" />
                    Daily Challenges
                  </h2>
                  {/* Rotating icon removed */}
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Win 3 debates today', progress: 2, total: 3, reward: '+50 ELO' },
                    { title: 'Participate in 5 debates', progress: 3, total: 5, reward: '+25 ELO' },
                    { title: 'Achieve 80% win rate', progress: 75, total: 80, reward: '+100 ELO' }
                  ].map((challenge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                      className="bg-white rounded-lg p-4 dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm dark:text-gray-100">{challenge.title}</h3>
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">{challenge.reward}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                            transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full dark:from-yellow-400 dark:to-orange-400"
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-8"
            >
              {/* Recent Activity */}
              <div className="rounded-2xl p-6 dark:bg-transparent">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 tracking-tight dark:text-gray-100">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </h2>
                  {/* Rotating icon removed */}
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
                    <span className="text-gray-600 text-sm dark:text-gray-300">Win Rate</span>
                    <span className="font-bold text-gray-800 dark:text-white">{stats.winRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm dark:text-gray-300">Current Streak</span>
                    <span className="font-bold text-gray-800 dark:text-white">{stats.currentStreak}</span>
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
    </>
  );
};

export default DashboardPage;
