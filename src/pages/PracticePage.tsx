import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Clock, Star, Play, Pause, RotateCcw, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuthStore, fetchUserFromFirestore } from '../stores/authStore';
import { useDebateStore } from '../stores/debateStore';
import Layout from '../components/layout/Layout';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

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
  },
  {
    id: '4',
    title: 'Are electric vehicles truly environmentally friendly?',
    category: 'Environment',
    difficulty: 'intermediate',
    description: 'Debate the full environmental impact of electric vehicles.',
    estimatedTime: 12,
    aiPersonality: 'Evidence-based and thorough',
    tips: [
      'Consider the full lifecycle impact',
      'Address battery production and disposal',
      'Compare with traditional vehicles'
    ]
  },
  {
    id: '5',
    title: 'Should AI development be paused?',
    category: 'Technology',
    difficulty: 'advanced',
    description: 'Practice with this cutting-edge technology debate.',
    estimatedTime: 18,
    aiPersonality: 'Forward-thinking and cautious',
    tips: [
      'Consider both safety and progress',
      'Address economic implications',
      'Think about international competition'
    ]
  }
];

const PracticePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [showTips, setShowTips] = useState(false);
  const [isCreatingPractice, setIsCreatingPractice] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchUserFromFirestore(user.uid, useAuthStore.setState);
    }
  }, [user?.uid]);

  const filteredTopics = practiceTopics.filter(topic => topic.difficulty === selectedDifficulty);

  const startPractice = async (topic: PracticeTopic) => {
    if (!user) {
      alert('Please sign in to start practice');
      return;
    }

    setIsCreatingPractice(true);
    setSelectedTopic(topic);

    try {
      console.log('Starting practice with topic:', topic.title);
      
      // Create a practice debate with all metadata
      const debateId = await useDebateStore.getState().createDebate(
        topic.title,
        topic.category.toLowerCase(),
        topic.difficulty === 'beginner' ? 2 : topic.difficulty === 'intermediate' ? 5 : 8
      );
      
      console.log('Created debate with ID:', debateId);

      // Join as pro
      await useDebateStore.getState().joinDebate(debateId, user.uid, 'pro');
      console.log('Joined debate as pro');

      // Add AI opponent with proper participant data
      const currentTime = Date.now();
      const aiParticipant = {
        userId: 'ai_opponent',
        displayName: 'AI Opponent',
        rating: 1200,
        stance: 'con' as const,
        isOnline: true,
        isTyping: false,
        lastSeen: currentTime
      };

      // Update debate with AI opponent and practice metadata - simplified approach
      const debateRef = doc(firestore, 'debates', debateId);
      try {
        await updateDoc(debateRef, {
          isPractice: true,
          aiPersonality: topic.aiPersonality,
          practiceTips: topic.tips
        });
        console.log('Added practice metadata');
        
        // Add both user and AI to participants and participantIds
        const userParticipant = {
          userId: user.uid,
          displayName: user.displayName || 'You',
          rating: 1200,
          stance: 'pro',
          isOnline: true,
          isTyping: false,
          lastSeen: currentTime
        };
        await updateDoc(debateRef, {
          participants: [userParticipant, aiParticipant],
          participantIds: [user.uid, 'ai_opponent']
        });
        console.log('[DEBUG] PracticePage: Set participants and participantIds to', [user.uid, 'ai_opponent']);

        // Force status to 'active' after both participants are added
        await updateDoc(debateRef, { status: 'active' });
        console.log('[DEBUG] PracticePage: Set debate status to active');

        // Wait for Firestore to update and fetch the debate
        let debateSnap = null;
        let debateData = null;
        let attempts = 0;
        while (attempts < 5) {
          debateSnap = await getDoc(debateRef);
          debateData = debateSnap.data();
          if (debateSnap.exists() && debateData && Array.isArray(debateData.participants) && debateData.participants.length > 0) {
            break;
          }
          await new Promise(res => setTimeout(res, 300)); // wait 300ms
          attempts++;
        }
        if (debateSnap && debateSnap.exists() && debateData && Array.isArray(debateData.participants) && debateData.participants.length > 0) {
          navigate(`/debate/${debateId}?mode=practice`);
        } else {
          alert('Failed to load debate. Please try again.');
        }
      } catch (updateError: any) {
        console.error('Failed to update debate metadata:', updateError);
        // If all else fails, just navigate to the debate
        console.log('Proceeding with basic debate setup');
        navigate(`/debate/${debateId}?mode=practice`);
      }

    } catch (error: any) {
      console.error('Failed to start practice:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to start practice: ${error.message}`);
    } finally {
      setIsCreatingPractice(false);
    }
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
                    disabled={isCreatingPractice}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingPractice && selectedTopic?.id === topic.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Practice...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Practice
                      </>
                    )}
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
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Practice Tips:</h4>
                    <ul className="space-y-1">
                      {topic.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-blue-800 dark:text-blue-200">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Practice Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Practice Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI Opponents
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Practice against intelligent AI opponents with different personalities and skill levels.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Instant Feedback
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get real-time AI feedback on your arguments, logic, and debate techniques.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Skill Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your progress and see improvements in your debating skills over time.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PracticePage;
