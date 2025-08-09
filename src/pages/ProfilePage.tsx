import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, Camera, Trophy, TrendingUp, Target, Award, User, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import SettingsForm from '../components/profile/SettingsForm';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
// Remove import { Switch } from '@headlessui/react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const achievements: Achievement[] = [
  {
    id: '1',
    name: 'First Victory',
    description: 'Win your first debate',
    icon: '🏆',
    unlocked: true,
    unlockedAt: new Date('2024-01-10'),
    rarity: 'common'
  },
  {
    id: '2',
    name: 'Streak Master',
    description: 'Win 5 debates in a row',
    icon: '🔥',
    unlocked: true,
    unlockedAt: new Date('2024-01-12'),
    rarity: 'rare'
  },
  {
    id: '3',
    name: 'Century Club',
    description: 'Reach 100 debates',
    icon: '💯',
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: '4',
    name: 'Elo Master',
    description: 'Reach 1500 rating',
    icon: '⭐',
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: '5',
    name: 'Topic Explorer',
    description: 'Debate in 10 different categories',
    icon: '🌍',
    unlocked: true,
    unlockedAt: new Date('2024-01-14'),
    rarity: 'rare'
  },
  {
    id: '6',
    name: 'Quick Thinker',
    description: 'Win a debate in under 10 minutes',
    icon: '⚡',
    unlocked: false,
    rarity: 'epic'
  }
];

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    debate_style: user?.debate_style || 'analytical',
    preferred_topics: user?.preferred_topics || []
  });
  const [recentDebates, setRecentDebates] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // User data is managed by the auth store

  useEffect(() => {
    const fetchRecentDebates = async () => {
      if (!user?.uid) return;
      const debatesQuery = query(
        collection(firestore, 'debates'),
        orderBy('createdAt', 'desc'),
        limit(10) // fetch more and filter in code
      );
      const snapshot = await getDocs(debatesQuery);
      const allDebates: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const userDebates: any[] = allDebates.filter(debate =>
        Array.isArray(debate.participants) &&
        debate.participants.some((p: any) => p.userId === user.uid)
      );
      setRecentDebates(userDebates.slice(0, 3));
    };
    fetchRecentDebates();
  }, [user?.uid]);

  // Fetch achievements from Firestore
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setAchievements(userData.achievements || []);
      }
    };
    fetchAchievements();
  }, [user?.uid]);

  // Fetch theme preference after login and set app theme
  useEffect(() => {
    const fetchTheme = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const theme = userData.preferences?.theme || 'light';
        setIsDarkMode(theme === 'dark');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    fetchTheme();
  }, [user?.uid]);

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleThemeChange = async (checked: boolean) => {
    setIsDarkMode(checked);
    const newTheme = checked ? 'dark' : 'light';
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to Firestore
    if (user?.uid) {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        preferences: {
          ...user.preferences,
          theme: newTheme,
        }
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 dark:text-amber-400';
      case 'silver': return 'text-gray-400 dark:text-gray-300';
      case 'gold': return 'text-yellow-500 dark:text-yellow-400';
      case 'platinum': return 'text-cyan-500 dark:text-cyan-400';
      case 'diamond': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTierBackground = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-700';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 'platinum': return 'bg-gradient-to-r from-cyan-400 to-cyan-500';
      case 'diamond': return 'bg-gradient-to-r from-blue-400 to-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const winRate = user ? Math.round((user.wins / Math.max(user.gamesPlayed, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <img
                  src={user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'}
                  alt={user?.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {isEditing ? (
                <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user?.displayName}
                  </h1>
                )}
                
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getTierBackground(user?.tier || 'bronze')}`}>
                  {user?.tier?.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.rating || 1200}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.level || 1}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Level</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {winRate}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {user?.bio || 'No bio yet. Click edit to add one!'}
                </p>
              )}

              <div className="flex gap-2 items-center">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                    {/* Custom theme switch beside Edit Profile */}
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={e => handleThemeChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 flex items-center px-1">
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <span className="ml-2 text-gray-700 dark:text-gray-200">{isDarkMode ? '🌙' : '🌞'}</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8"
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Achievements
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <>
              {/* Horizontal creative line above overview */}
              <div className="w-full h-1 mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full" />
              <div className="grid md:grid-cols-2 gap-8 relative">
                {/* Vertical creative line between columns */}
                <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full z-0" style={{transform: 'translateX(-50%)'}} />
                {/* Stats Overview */}
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Statistics</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Games Played</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{user?.gamesPlayed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Wins</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{user?.wins || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Losses</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{user?.losses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Draws</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">{user?.draws || 0}</span>
                    </div>
                  </div>
                </div>
                {/* Recent Activity */}
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentDebates.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No recent debates found.</div>
                    ) : (
                      recentDebates.map((debate, idx) => {
                        // Find opponent
                        const opponent = debate.participants?.find((p: any) => p.userId !== user?.uid);
                        const opponentName = opponent?.displayName || 'AI Opponent';
                        // Determine result
                        let result = 'Draw';
                        if (debate.judgment?.winner === user?.uid) result = 'Win';
                        else if (debate.judgment?.winner) result = 'Loss';
                        // Format date
                        let dateStr = '';
                        if (debate.createdAt?.toDate) {
                          dateStr = debate.createdAt.toDate().toLocaleString();
                        } else if (debate.createdAt) {
                          dateStr = new Date(debate.createdAt).toLocaleString();
                        }
                        return (
                          <div key={debate.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className={`font-bold ${result === 'Win' ? 'text-green-600 dark:text-green-400' : result === 'Loss' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{result}</div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{debate.topic || 'Untitled Topic'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">vs {opponentName}</div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'achievements' && (
            <div>
              {/* Horizontal creative line above achievements */}
              <div className="w-full h-1 mb-8 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full" />
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Achievements</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {achievements.length} unlocked
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">No achievements found.</div>
                ) : (
                  achievements.map((achievement: any, i: number) => (
                    <div
                      key={achievement.id || i}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{achievement.icon || '🏆'}</span>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {achievement.name || achievement}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {achievement.rarity || ''}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {achievement.description || ''}
                      </p>
                      {achievement.unlockedAt && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Unlocked {achievement.unlockedAt?.toLocaleDateString?.() || ''}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
