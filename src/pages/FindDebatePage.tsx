import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock, Users, TrendingUp, Zap, Target } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import Layout from '../components/layout/Layout';

interface Topic {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  popularity: number;
  description: string;
}

const topics: Topic[] = [
  {
    id: '1',
    title: 'Should social media platforms be regulated?',
    category: 'Technology',
    difficulty: 'medium',
    popularity: 95,
    description: 'Debate the role of government in regulating social media content and user privacy.'
  },
  {
    id: '2',
    title: 'Is remote work better than office work?',
    category: 'Business',
    difficulty: 'easy',
    popularity: 88,
    description: 'Compare the benefits and drawbacks of remote work versus traditional office environments.'
  },
  {
    id: '3',
    title: 'Should college education be free?',
    category: 'Education',
    difficulty: 'hard',
    popularity: 92,
    description: 'Discuss the economic and social implications of free higher education.'
  },
  {
    id: '4',
    title: 'Are electric vehicles truly environmentally friendly?',
    category: 'Environment',
    difficulty: 'medium',
    popularity: 85,
    description: 'Examine the full environmental impact of electric vehicles from production to disposal.'
  },
  {
    id: '5',
    title: 'Should AI development be paused?',
    category: 'Technology',
    difficulty: 'hard',
    popularity: 90,
    description: 'Debate whether we should slow down AI development for safety considerations.'
  }
];

const FindDebatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isFindingMatch, setIsFindingMatch] = useState(false);

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', ...Array.from(new Set(topics.map(t => t.category)))];

  const handleFindMatch = async (topic: Topic) => {
    setIsFindingMatch(true);
    setSelectedTopic(topic);
    
    // Simulate matchmaking process
    setTimeout(() => {
      setIsFindingMatch(false);
      // Navigate to debate room with topic
      navigate(`/debate/new?topic=${topic.id}`);
    }, 3000);
  };

  const handleCreateDebate = (topic: Topic) => {
    navigate(`/debate/new?topic=${topic.id}&mode=create`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Next Debate
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from trending topics or create your own debate. Challenge opponents 
              and climb the leaderboard with every victory.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </motion.div>

          {/* Topics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      topic.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {topic.difficulty}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {topic.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{topic.popularity}%</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {topic.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {topic.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleFindMatch(topic)}
                    disabled={isFindingMatch}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isFindingMatch && selectedTopic?.id === topic.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Finding Match...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Find Match
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleCreateDebate(topic)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Avg. Wait Time
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">45s</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Active Players
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">1,247</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Rating
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {user?.rating || 1200}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FindDebatePage;
