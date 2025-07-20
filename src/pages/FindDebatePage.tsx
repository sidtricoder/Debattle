import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Zap, 
  Brain, 
  Trophy, 
  Users, 
  Target, 
  Star, 
  Clock, 
  TrendingUp,
  Sparkles,
  Crown,
  Shield,
  Sword,
  Flame,
  ArrowRight,
  Play
} from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { firestore } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import Footer from '../components/layout/Footer';
import MatchmakingModal from '../components/debate/MatchmakingModal';

const FindDebatePage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsQuery = query(
          collection(firestore, 'topics'),
          orderBy('usageCount', 'desc'),
          limit(20)
        );
        const topicsSnapshot = await getDocs(topicsQuery);
        const topicsData = topicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching topics:', error);
        // Fallback data matching the actual Firestore schema
        setTopics([
          {
            id: 'topic1',
            title: 'Should artificial intelligence replace human judges in courts?',
            category: 'technology',
            difficulty: 8,
            usageCount: 8,
            averageRating: 4.2,
            description: 'Debate whether AI systems should be used to make judicial decisions in legal proceedings.',
            isOfficial: true,
            trending: true,
            tags: ['AI', 'justice', 'ethics', 'law']
          },
          {
            id: 'topic2',
            title: 'Is remote work better than office work?',
            category: 'business',
            difficulty: 6,
            usageCount: 12,
            averageRating: 4.0,
            description: 'Discuss the benefits and drawbacks of remote work versus traditional office environments.',
            isOfficial: true,
            trending: true,
            tags: ['work', 'productivity', 'lifestyle', 'business']
          },
          {
            id: 'topic3',
            title: 'Should universities be free for everyone?',
            category: 'education',
            difficulty: 7,
            usageCount: 15,
            averageRating: 4.5,
            description: 'Debate whether higher education should be publicly funded and accessible to all.',
            isOfficial: true,
            trending: false,
            tags: ['education', 'economics', 'society', 'policy']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const categories = [
    { name: 'all', label: 'All Topics', icon: Target, emoji: '🎯' },
    { name: 'technology', label: 'Technology', icon: Zap, emoji: '⚡' },
    { name: 'politics', label: 'Politics', icon: Crown, emoji: '👑' },
    { name: 'business', label: 'Business', icon: TrendingUp, emoji: '📈' },
    { name: 'education', label: 'Education', icon: Brain, emoji: '🧠' },
    { name: 'society', label: 'Society', icon: Users, emoji: '👥' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels', emoji: '🌟' },
    { value: 'easy', label: 'Easy (1-3)', emoji: '😊' },
    { value: 'medium', label: 'Medium (4-6)', emoji: '🤔' },
    { value: 'hard', label: 'Hard (7-9)', emoji: '🔥' },
    { value: 'expert', label: 'Expert (10)', emoji: '💎' }
  ];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category.toLowerCase() === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || 
      (selectedDifficulty === 'easy' && topic.difficulty <= 3) ||
      (selectedDifficulty === 'medium' && topic.difficulty >= 4 && topic.difficulty <= 6) ||
      (selectedDifficulty === 'hard' && topic.difficulty >= 7 && topic.difficulty <= 9) ||
      (selectedDifficulty === 'expert' && topic.difficulty === 10);
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'from-green-400 to-emerald-500';
    if (difficulty <= 6) return 'from-yellow-400 to-orange-500';
    if (difficulty <= 9) return 'from-red-400 to-pink-500';
    return 'from-purple-400 to-indigo-500';
  };

  const getDifficultyEmoji = (difficulty: number) => {
    if (difficulty <= 3) return '😊';
    if (difficulty <= 6) return '🤔';
    if (difficulty <= 9) return '🔥';
    return '💎';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-600 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex flex-col">
      <div className="relative overflow-hidden flex-1">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-500">Battle</span>
                  </h1>
                  <p className="text-xl text-blue-100">
                    Choose from thousands of topics and challenge worthy opponents
                  </p>
                </div>
              </div>
              {/* Search Bar */}
              <div className="w-full max-w-2xl mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for debate topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-2xl text-gray-800 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-xl"
                  />
                </div>
              </div>
              {/* Filters */}
              <div className="w-full mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-500" />
                    Filter Topics
                  </h2>
                  <div className="text-2xl">🔍</div>
                </div>
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = selectedCategory === category.name;
                      return (
                        <button
                          key={category.name}
                          onClick={() => setSelectedCategory(category.name)}
                          className={`p-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900'
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{category.emoji}</div>
                            <div className={`text-sm font-medium ${
                              isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {category.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Difficulty Levels */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Difficulty Level</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {difficulties.map((difficulty) => {
                      const isActive = selectedDifficulty === difficulty.value;
                      return (
                        <button
                          key={difficulty.value}
                          onClick={() => setSelectedDifficulty(difficulty.value)}
                          className={`p-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-yellow-50 dark:bg-yellow-900'
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{difficulty.emoji}</div>
                            <div className={`text-sm font-medium ${
                              isActive ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {difficulty.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Topics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 rounded-3xl overflow-hidden transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-b ${getDifficultyColor(topic.difficulty)}`}> 
                        {getDifficultyEmoji(topic.difficulty)} {topic.difficulty}/10
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{topic.usageCount || 0}</span>
                      </div>
                    </div>
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 leading-tight">
                      {topic.title}
                    </h3>
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                      {topic.description}
                    </p>
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{topic.category}</span>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedTopic(topic);
                          setShowMatchmaking(true);
                        }}
                        className="flex-1 bg-gradient-to-b from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Quick Match
                      </button>
                      <button
                        className="px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            {/* No Results */}
            {filteredTopics.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No topics found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Matchmaking Modal */}
      <MatchmakingModal
        open={showMatchmaking}
        onClose={() => {
          setShowMatchmaking(false);
          setSelectedTopic(null);
        }}
        topicId={selectedTopic?.id || ''}
        topicTitle={selectedTopic?.title || ''}
        userId={user?.uid || ''}
        userRating={user?.rating || 1000}
      />
      <Footer />
    </div>
  );
};

export default FindDebatePage;
