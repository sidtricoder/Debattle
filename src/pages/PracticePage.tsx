import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Clock, Star, Play, Pause, RotateCcw, MessageSquare, TrendingUp, Zap, Award, Users, Sparkles } from 'lucide-react';
import { useAuthStore, fetchUserFromFirestore } from '../stores/authStore';
import { useDebateStore } from '../stores/debateStore';
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
      case 'beginner': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      case 'intermediate': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'advanced': return 'bg-gradient-to-r from-red-400 to-pink-500 text-white';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 text-4xl opacity-10"
        >
          🧠
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-20 text-3xl opacity-10"
        >
          ⚡
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 left-20 text-2xl opacity-10"
        >
          🎯
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            x: [0, -15, 0]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 text-3xl opacity-10"
        >
          🏆
        </motion.div>
        {/* Additional faded icons for more dynamic background */}
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 text-7xl opacity-5"
        >
          <Star className="w-16 h-16 text-yellow-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/3 text-6xl opacity-5"
        >
          <Zap className="w-14 h-14 text-blue-400" />
        </motion.div>
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/2 text-5xl opacity-5"
        >
          <Award className="w-12 h-12 text-pink-400" />
        </motion.div>
        <motion.div
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 text-6xl opacity-5"
        >
          <Users className="w-14 h-14 text-green-400" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Practice Arena
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 Master the art of debate with our intelligent AI opponents. 
            Choose your challenge level and sharpen your argumentation skills!
          </p>
        </motion.div>

        {/* Fancy separator */}
        <div className="flex justify-center mb-12">
          <hr className="w-2/3 h-1 rounded-full border-0 bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-200 opacity-60" />
        </div>

        {/* Practice Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-stretch justify-center mb-12 gap-0"
        >
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">24</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Practice Sessions</div>
          </div>
          <div className="hidden md:flex w-px mx-0 my-6 bg-gradient-to-b from-purple-200 via-pink-200 to-yellow-100 opacity-60" />
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">6.5h</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Total Practice Time</div>
          </div>
          <div className="hidden md:flex w-px mx-0 my-6 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-100 opacity-50" />
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">8.2</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Avg. Score</div>
          </div>
          <div className="hidden md:flex w-px mx-0 my-6 bg-gradient-to-b from-orange-200 via-red-200 to-pink-100 opacity-40" />
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">+45</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Rating Gain</div>
          </div>
        </motion.div>

        {/* Fancy separator */}
        <div className="flex justify-center mb-12">
          <hr className="w-1/2 h-0.5 rounded-full border-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 opacity-50" />
        </div>

        {/* Difficulty Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🎯 Choose Your Challenge Level
          </h2>
          <div className="flex gap-4 justify-center">
            {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-none border-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                  selectedDifficulty === difficulty
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                    : 'bg-white/40 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60'
                }`}
              >
                {difficulty === 'beginner' && '🌱'}
                {difficulty === 'intermediate' && '⚡'}
                {difficulty === 'advanced' && '🔥'}
                {' '}
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Fancy separator */}
        <div className="flex justify-center mb-12">
          <hr className="w-1/2 h-0.5 rounded-full border-0 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 opacity-40" />
        </div>

        {/* Practice Topics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col lg:flex-row items-stretch justify-center mb-12 gap-0"
        >
          {filteredTopics.map((topic, index) => (
            <React.Fragment key={topic.id}>
              <div className="p-8 transition-all duration-300 flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-none ${getDifficultyColor(topic.difficulty)}`}> 
                    {topic.difficulty === 'beginner' && '🌱'}
                    {topic.difficulty === 'intermediate' && '⚡'}
                    {topic.difficulty === 'advanced' && '🔥'}
                    {' '}
                    {topic.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{topic.estimatedTime}m</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {topic.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  {topic.description}
                </p>

                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Personality:
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    {topic.aiPersonality}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => startPractice(topic)}
                    disabled={isCreatingPractice}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-none disabled:opacity-50"
                  >
                    {isCreatingPractice && selectedTopic?.id === topic.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Practice...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Practice
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="w-full border-2 border-purple-100 dark:border-purple-700 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 text-sm font-medium shadow-none"
                  >
                    {showTips ? '🙈 Hide' : '💡 Show'} Tips
                  </button>
                </div>

                {showTips && (
                  <div
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-100 dark:border-yellow-700"
                  >
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Practice Tips:
                    </h4>
                    <ul className="space-y-2">
                      {topic.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Only show separator between cards, not after the last */}
              {(index !== filteredTopics.length - 1) && (
                <div className="hidden lg:flex w-px mx-0 my-8 bg-gradient-to-b from-purple-200 via-pink-200 to-yellow-100 opacity-40" />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Fancy separator */}
        <div className="flex justify-center mb-12">
          <hr className="w-1/2 h-0.5 rounded-full border-0 bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200 opacity-40" />
        </div>

        {/* Practice Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-12"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🚀 Why Practice with Debattle?
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🤖 Intelligent AI Opponents
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Practice against AI opponents with different personalities, skill levels, and debate styles. 
                Each AI adapts to your skill level for the perfect challenge.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ⚡ Instant Feedback & Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Get real-time AI feedback on your arguments, logic structure, and debate techniques. 
                Learn from detailed analysis and improve with every practice session.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📈 Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Track your progress with detailed analytics, skill assessments, and performance metrics. 
                Watch your debating skills improve over time with visual progress indicators.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PracticePage;
