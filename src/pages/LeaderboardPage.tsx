import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp, Users, Target, Search } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

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
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'games' | 'winRate'>('rating');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const usersQuery = query(collection(firestore, 'users'), orderBy('rating', 'desc'));
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map((doc, idx) => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName,
          username: data.username,
          photoURL: data.photoURL,
          rating: data.rating,
          tier: data.tier,
          gamesPlayed: data.gamesPlayed,
          winRate: data.win_rate,
          level: data.level,
          rank: idx + 1, // Assign rank based on sorted order
        };
      });
      setLeaderboard(users);
    };
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(player => {
    return player.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           player.username.toLowerCase().includes(searchTerm.toLowerCase());
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



  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const userRank = leaderboard.find(player => player.id === user?.uid);

  // Calculate stats from leaderboard data
  const totalPlayers = leaderboard.length;
  const activeToday = leaderboard.filter(player => player.gamesPlayed > 0).length; // Example: players with games played > 0
  const avgRating = leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, p) => sum + (p.rating || 0), 0) / leaderboard.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>
      <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1
              className="mb-4"
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontWeight: 700,
                fontSize: '3.5rem',
                color: '#4f46e5',
                letterSpacing: '1px',
                textShadow: '0 2px 12px rgba(79,70,229,0.08)'
              }}
            >
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
              className="mb-8 px-0"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Ranking</h2>
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
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
            className="mb-8 px-0"
          >
            <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

{/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Sort by Rating</option>
                <option value="games" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Sort by Games</option>
                <option value="winRate" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Sort by Win Rate</option>
              </select>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto scrollbar-fade">
              <table className="w-full border-separate border-spacing-y-0">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">Games</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((player, index) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="transition-colors border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            #{player.rank}
                          </span>
                          {getRankIcon(player.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
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
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {player.rating}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        {player.gamesPlayed}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.round((player.winRate || 0) * 100)}%
                          </span>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
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
            <div className="text-center flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-transparent shadow-none">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Total Players
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPlayers}</p>
            </div>

            <div className="text-center flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-transparent shadow-none">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Active Today
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeToday}</p>
            </div>

            <div className="text-center flex flex-col items-center justify-center bg-transparent shadow-none">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Avg. Rating
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{avgRating}</p>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default LeaderboardPage;
