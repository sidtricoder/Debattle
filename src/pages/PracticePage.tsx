import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Clock, Star, Play, Pause, RotateCcw, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import Layout from '../components/layout/Layout';

interface PracticeTopic {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  estimatedTime: number;
  aiPersonality: string;
  tips: string[];
}

const practiceTopics: PracticeTopic[] = [
  {
    id: '1',
    title: 'Should social media platforms be regulated?',
    category: 'Technology',
    difficulty: 'intermediate',
    description: 'Practice arguing both sides of social media regulation with our AI opponent.',
    estimatedTime: 15,
    aiPersonality: 'Analytical and data-driven',
    tips: [
      'Focus on concrete examples of regulation impact',
      'Consider both user privacy and platform responsibility',
      'Address potential unintended consequences'
    ]
  },
  {
    id: '2',
    title: 'Is remote work better than office work?',
    category: 'Business',
    difficulty: 'beginner',
    description: 'A great starting topic to practice your debating skills.',
    estimatedTime: 10,
    aiPersonality: 'Balanced and fair',
    tips: [
      'Consider productivity metrics',
      'Think about work-life balance',
      'Address team collaboration challenges'
    ]
  },
  {
    id: '3',
    title: 'Should college education be free?',
    category: 'Education',
    difficulty: 'advanced',
    description: 'Challenge yourself with this complex economic and social issue.',
    estimatedTime: 20,
    aiPersonality: 'Critical and thorough',
    tips: [
      'Research funding mechanisms',
      'Consider accessibility vs. quality',
      'Address long-term economic impacts'
    ]
  }
];

const PracticePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [showTips, setShowTips] = useState(false);

  const filteredTopics = practiceTopics.filter(topic => topic.difficulty === selectedDifficulty);

  const startPractice = (topic: PracticeTopic) => {
    setSelectedTopic(topic);
    setIsPracticing(true);
    setPracticeTime(0);
  };

  const stopPractice = () => {
    setIsPracticing(false);
    setSelectedTopic(null);
    setPracticeTime(0);
  };

  // Simulate practice timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPracticing) {
      interval = setInterval(() => {
        setPracticeTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPracticing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Practice Mode
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hone your debating skills with our AI opponents. Practice different topics, 
            difficulty levels, and improve your argumentation techniques.
          </p>
        </motion.div>

        {/* Practice Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">24</div>
            <div className="text-gray-600 dark:text-gray-300">Practice Sessions</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">6.5h</div>
            <div className="text-gray-600 dark:text-gray-300">Total Practice Time</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">8.2</div>
            <div className="text-gray-600 dark:text-gray-300">Avg. Score</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">+45</div>
            <div className="text-gray-600 dark:text-gray-300">Rating Gain</div>
          </div>
        </motion.div>

        {/* Difficulty Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Difficulty</h2>
          <div className="flex gap-4">
            {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedDifficulty === difficulty
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Practice Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                  {topic.difficulty}
                </span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{topic.estimatedTime}m</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {topic.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {topic.description}
              </p>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  AI Personality:
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {topic.aiPersonality}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => startPractice(topic)}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Practice
                </button>
                
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {showTips ? 'Hide' : 'Show'} Tips
                </button>
              </div>

              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tips for this topic:
                  </div>
                  <ul className="space-y-1">
                    {topic.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Active Practice Session */}
        {isPracticing && selectedTopic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Practice Session
                </h2>
                <div className="text-4xl font-mono text-blue-600 dark:text-blue-400 mb-4">
                  {formatTime(practiceTime)}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Topic: {selectedTopic.title}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Opponent: {selectedTopic.aiPersonality}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  The AI is analyzing your arguments and will provide feedback at the end of the session.
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={stopPractice}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  End Session
                </button>
                <button
                  onClick={() => setPracticeTime(0)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Practice Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Practice Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Before You Start</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Research the topic thoroughly</li>
                <li>• Prepare arguments for both sides</li>
                <li>• Set a clear goal for your practice session</li>
                <li>• Find a quiet environment to focus</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">During Practice</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Speak clearly and at a measured pace</li>
                <li>• Use evidence to support your arguments</li>
                <li>• Address counterarguments directly</li>
                <li>• Stay respectful and professional</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </Layout>
  );
};

export default PracticePage;
