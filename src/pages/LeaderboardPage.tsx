import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp, Users, Target, Search } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import Layout from '../components/layout/Layout';

interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  username: string;
  photoURL: string;
  rating: number;
  tier: string;
  gamesPlayed: number;
  winRate: number;
  winStreak: number;
  level: number;
}

const mockLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    rank: 1,
    displayName: 'Alex Johnson',
    username: 'alex_j',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    rating: 1850,
    tier: 'diamond',
    gamesPlayed: 156,
    winRate: 78,
    winStreak: 12,
    level: 25
  },
  {
    id: '2',
    rank: 2,
    displayName: 'Sarah Chen',
    username: 'sarah_c',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    rating: 1820,
    tier: 'diamond',
    gamesPlayed: 142,
    winRate: 75,
    winStreak: 8,
    level: 23
  },
  {
    id: '3',
    rank: 3,
    displayName: 'Mike Rodriguez',
    username: 'mike_r',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    rating: 1780,
    tier: 'platinum',
    gamesPlayed: 189,
    winRate: 72,
    winStreak: 15,
    level: 28
  },
  {
    id: '4',
    rank: 4,
    displayName: 'Emma Wilson',
    username: 'emma_w',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    rating: 1750,
    tier: 'platinum',
    gamesPlayed: 134,
    winRate: 76,
    winStreak: 6,
    level: 22
  },
  {
    id: '5',
    rank: 5,
    displayName: 'David Kim',
    username: 'david_k',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    rating: 1720,
    tier: 'platinum',
    gamesPlayed: 167,
    winRate: 71,
    winStreak: 9,
    level: 26
  },
  {
    id: '6',
    rank: 6,
    displayName: 'Lisa Thompson',
    username: 'lisa_t',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    rating: 1680,
    tier: 'gold',
    gamesPlayed: 145,
    winRate: 69,
    winStreak: 7,
    level: 21
  },
  {
    id: '7',
    rank: 7,
    displayName: 'James Brown',
    username: 'james_b',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    rating: 1650,
    tier: 'gold',
    gamesPlayed: 178,
    winRate: 68,
    winStreak: 5,
    level: 24
  },
  {
    id: '8',
    rank: 8,
    displayName: 'Maria Garcia',
    username: 'maria_g',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    rating: 1620,
    tier: 'gold',
    gamesPlayed: 123,
    winRate: 73,
    winStreak: 11,
    level: 19
  },
  {
    id: '9',
    rank: 9,
    displayName: 'John Smith',
    username: 'john_s',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    rating: 1590,
    tier: 'silver',
    gamesPlayed: 156,
    winRate: 67,
    winStreak: 4,
    level: 20
  },
  {
    id: '10',
    rank: 10,
    displayName: 'Anna Davis',
    username: 'anna_d',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    rating: 1560,
    tier: 'silver',
    gamesPlayed: 134,
    winRate: 70,
    winStreak: 8,
    level: 18
  }
];

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'games' | 'winRate'>('rating');

  const filteredLeaderboard = mockLeaderboard.filter(player => {
    const matchesSearch = player.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'all' || player.tier === selectedTier;
    
    return matchesSearch && matchesTier;
  });

  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'games':
        return b.gamesPlayed - a.gamesPlayed;
      case 'winRate':
        return b.winRate - a.winRate;
      default:
        return 0;
    }
  });

  const tiers = ['all', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-gradient-to-r from-blue-400 to-purple-500 text-white';
      case 'platinum': return 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const userRank = mockLeaderboard.find(player => player.id === user?.uid);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Global Leaderboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how you rank against the world's best debaters
            </p>
          </motion.div>

          {/* User's Rank */}
          {userRank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200 dark:border-blue-800"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Ranking</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    #{userRank.rank}
                  </div>
                  <img
                    src={userRank.photoURL}
                    alt={userRank.displayName}
                    className="w-12 h-12 rounded-full"
                  />
            <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {userRank.displayName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      @{userRank.username}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRank.rating}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="games">Sort by Games</option>
                <option value="winRate">Sort by Win Rate</option>
              </select>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Tier</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Games</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Win Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Streak</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedLeaderboard.map((player, index) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            #{player.rank}
                          </span>
                          {getRankIcon(player.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.photoURL}
                            alt={player.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {player.displayName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{player.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {player.rating}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(player.tier)}`}>
                          {player.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {player.gamesPlayed}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {player.winRate}%
                          </span>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {player.winStreak}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {player.level}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Total Players
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">12,847</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Active Today
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">1,247</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Avg. Rating
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">1,245</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
