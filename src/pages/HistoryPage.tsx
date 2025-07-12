import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Trophy, TrendingUp, TrendingDown, Minus, Search, Filter } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import Layout from '../components/layout/Layout';

interface DebateHistory {
  id: string;
  topic: string;
  opponent: {
    name: string;
    rating: number;
    photoURL: string;
  };
  result: 'win' | 'loss' | 'draw';
  date: Date;
  duration: number; // in minutes
  ratingChange: number;
  score: {
    user: number;
    opponent: number;
  };
  category: string;
}

const mockHistory: DebateHistory[] = [
  {
    id: '1',
    topic: 'Should social media platforms be regulated?',
    opponent: {
      name: 'Alex Johnson',
      rating: 1250,
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    result: 'win',
    date: new Date('2024-01-15T14:30:00'),
    duration: 25,
    ratingChange: 15,
    score: { user: 85, opponent: 72 },
    category: 'Technology'
  },
  {
    id: '2',
    topic: 'Is remote work better than office work?',
    opponent: {
      name: 'Sarah Chen',
      rating: 1180,
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    result: 'loss',
    date: new Date('2024-01-14T16:45:00'),
    duration: 32,
    ratingChange: -12,
    score: { user: 68, opponent: 89 },
    category: 'Business'
  },
  {
    id: '3',
    topic: 'Should college education be free?',
    opponent: {
      name: 'Mike Rodriguez',
      rating: 1320,
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    result: 'draw',
    date: new Date('2024-01-13T10:15:00'),
    duration: 28,
    ratingChange: 0,
    score: { user: 78, opponent: 78 },
    category: 'Education'
  },
  {
    id: '4',
    topic: 'Are electric vehicles truly environmentally friendly?',
    opponent: {
      name: 'Emma Wilson',
      rating: 1210,
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    result: 'win',
    date: new Date('2024-01-12T19:20:00'),
    duration: 22,
    ratingChange: 18,
    score: { user: 91, opponent: 65 },
    category: 'Environment'
  },
  {
    id: '5',
    topic: 'Should AI development be paused?',
    opponent: {
      name: 'David Kim',
      rating: 1280,
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
    },
    result: 'loss',
    date: new Date('2024-01-11T13:10:00'),
    duration: 35,
    ratingChange: -8,
    score: { user: 74, opponent: 82 },
    category: 'Technology'
  }
];

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'duration'>('date');

  const filteredHistory = mockHistory.filter(debate => {
    const matchesSearch = debate.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debate.opponent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResult = selectedResult === 'all' || debate.result === selectedResult;
    const matchesCategory = selectedCategory === 'all' || debate.category === selectedCategory;
    
    return matchesSearch && matchesResult && matchesCategory;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.date.getTime() - a.date.getTime();
      case 'rating':
        return Math.abs(b.ratingChange) - Math.abs(a.ratingChange);
      case 'duration':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  const categories = ['all', ...Array.from(new Set(mockHistory.map(d => d.category)))];

  const stats = {
    total: mockHistory.length,
    wins: mockHistory.filter(d => d.result === 'win').length,
    losses: mockHistory.filter(d => d.result === 'loss').length,
    draws: mockHistory.filter(d => d.result === 'draw').length,
    winRate: Math.round((mockHistory.filter(d => d.result === 'win').length / mockHistory.length) * 100),
    totalRatingChange: mockHistory.reduce((sum, d) => sum + d.ratingChange, 0),
    avgDuration: Math.round(mockHistory.reduce((sum, d) => sum + d.duration, 0) / mockHistory.length)
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'loss':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'draw':
        return <Minus className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win':
        return 'text-green-600 dark:text-green-400';
      case 'loss':
        return 'text-red-600 dark:text-red-400';
      case 'draw':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Debate History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your performance and analyze your debating journey
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats.total}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Total Debates</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.winRate}%
            </div>
            <div className="text-gray-600 dark:text-gray-300">Win Rate</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats.totalRatingChange > 0 ? '+' : ''}{stats.totalRatingChange}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Rating Change</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {stats.avgDuration}m
            </div>
            <div className="text-gray-600 dark:text-gray-300">Avg Duration</div>
          </div>
        </motion.div>

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
                placeholder="Search topics or opponents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Result Filter */}
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="win">Wins</option>
              <option value="loss">Losses</option>
              <option value="draw">Draws</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="rating">Sort by Rating Change</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </motion.div>

        {/* Debate History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {sortedHistory.map((debate, index) => (
            <motion.div
              key={debate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Result Icon */}
                  <div className="flex items-center gap-2">
                    {getResultIcon(debate.result)}
                    <span className={`font-semibold ${getResultColor(debate.result)}`}>
                      {debate.result.toUpperCase()}
                    </span>
                  </div>

                  {/* Opponent Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={debate.opponent.photoURL}
                      alt={debate.opponent.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {debate.opponent.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Rating: {debate.opponent.rating}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {debate.score.user} - {debate.score.opponent}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                  </div>

                  {/* Rating Change */}
                  <div className="text-center">
                    <div className={`text-lg font-bold ${debate.ratingChange > 0 ? 'text-green-600 dark:text-green-400' : debate.ratingChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {debate.ratingChange > 0 ? '+' : ''}{debate.ratingChange}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                  </div>

                  {/* Duration */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {debate.duration}m
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  </div>

                  {/* Date */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(debate.date)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                  </div>
                </div>
              </div>

              {/* Topic */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {debate.topic}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {debate.category}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/debate/${debate.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {sortedHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No debates found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start your first debate to see your history here
            </p>
            <Link
              to="/find-debate"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find a Debate
            </Link>
          </motion.div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default HistoryPage;
