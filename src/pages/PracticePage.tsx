import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Clock, Star, Play, Pause, RotateCcw, MessageSquare, TrendingUp, Zap, Award, Users, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDebateStore } from '../stores/debateStore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { PracticeSettingsModal } from '../components/practice/PracticeSettingsModal';
import Footer from '../components/layout/Footer';
import practiceTopicsData from '../data/practiceTopics.json';

const practiceTopics = practiceTopicsData as PracticeTopic[];

export interface PracticeTopic {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  estimatedTime: number;
  aiPersonality: string;
  tips: string[];
}

const PracticePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [isCreatingPractice, setIsCreatingPractice] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [practiceStats, setPracticeStats] = useState({
    practiceSessions: 0,
    practiceTime: 0,
    practiceAvgScore: 0,
    practiceRatingGain: 0
  });
  const [practiceTime, setPracticeTime] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<PracticeTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter topics by difficulty and search query
  const filteredTopics = practiceTopics.filter(topic => {
    const matchesDifficulty = topic.difficulty === selectedDifficulty;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && (searchQuery === '' || matchesSearch);
  });

  useEffect(() => {
    const fetchPracticeStats = async () => {
      if (!user) return;
      try {
        console.log('USER UID:', user?.uid);
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Fetched Firestore user data:', data);
          setPracticeStats({
            practiceSessions: data.practiceSessions || 0,
            practiceTime: data.practiceTime || 0,
            practiceAvgScore: data.practiceAvgScore || 0,
            practiceRatingGain: (data.rating || 1200) - 1200
          });
        }
      } catch (e) {
        console.log('Fallback user object:', user);
        setPracticeStats({
          practiceSessions: user.practiceSessions || 0,
          practiceTime: user.practiceTime || 0,
          practiceAvgScore: user.practiceAvgScore || 0,
          practiceRatingGain: (user.rating || 1200) - 1200
        });
      }
    };
    fetchPracticeStats();
  }, [user]);

  const startPractice = async (topic: PracticeTopic) => {
    if (!user) {
      alert('Please sign in to start practice');
      return;
    }

    setPendingTopic(topic);
    setShowSettingsModal(true);
  };

  const createPracticeWithSettings = async (settings: {
    aiProvider: 'gemini' | 'llama' | 'gemma';
    timeoutSeconds: number;
    numberOfRounds: number;
    userStance: 'pro' | 'con';
  }) => {
    if (!user || !pendingTopic) {
      alert('Please sign in to start practice');
      return;
    }

    setIsCreatingPractice(true);
    setSelectedTopic(pendingTopic);

    try {
      console.log('Starting practice with topic:', pendingTopic.title);
      
      // Create a practice debate with all metadata
      const debateId = await useDebateStore.getState().createDebate(
        pendingTopic.title,
        pendingTopic.category.toLowerCase(),
        pendingTopic.difficulty === 'beginner' ? 2 : pendingTopic.difficulty === 'intermediate' ? 5 : 8
      );
      
      console.log('Created debate with ID:', debateId);

      // Join with user's chosen stance
      await useDebateStore.getState().joinDebate(debateId, user.uid, settings.userStance);
      console.log(`Joined debate as ${settings.userStance}`);

      // Add AI opponent with proper participant data
      const currentTime = Date.now();
      const aiStance: 'pro' | 'con' = settings.userStance === 'pro' ? 'con' : 'pro';
      const aiParticipant = {
        userId: 'ai_opponent',
        displayName: 'AI Opponent',
        rating: 1200,
        stance: aiStance,
        isOnline: true,
        isTyping: false,
        lastSeen: currentTime
      };

      // Update debate with AI opponent and practice metadata - simplified approach
      const debateRef = doc(firestore, 'debates', debateId);
      try {
        await updateDoc(debateRef, {
          isPractice: true,
          aiPersonality: pendingTopic.aiPersonality,
          practiceTips: pendingTopic.tips,
          practiceSettings: {
            aiProvider: settings.aiProvider,
            timeoutSeconds: settings.timeoutSeconds,
            numberOfRounds: settings.numberOfRounds,
            userStance: settings.userStance
          }
        });
        console.log('Added practice metadata');
        
        // Add both user and AI to participants and participantIds
        const userParticipant = {
          userId: user.uid,
          displayName: user.displayName || `User ${user.uid.slice(-4)}`,
          rating: user.rating,
          stance: settings.userStance,
          isOnline: true,
          isTyping: false,
          lastSeen: currentTime
        };
        await updateDoc(debateRef, {
          participants: [userParticipant, aiParticipant],
          participantIds: [user.uid, 'ai_opponent']
        });
        // Set currentTurn to the pro side
        const proParticipant = [userParticipant, aiParticipant].find(p => p.stance === 'pro');
        if (proParticipant) {
          await updateDoc(debateRef, { currentTurn: proParticipant.userId });
        }
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
      alert('Failed to start practice. Please try again.');
    } finally {
      setIsCreatingPractice(false);
      setPendingTopic(null);
    }
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
    setPendingTopic(null);
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>
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
          <h1
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontWeight: 700,
              fontSize: '3.5rem',
              color: '#4f46e5',
              letterSpacing: '1px',
              textShadow: '0 2px 12px rgba(79,70,229,0.08)'
            }}
            className="mb-4"
          >
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
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">{practiceStats.practiceSessions}</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Practice Sessions</div>
          </div>
          <div className="hidden md:flex w-px mx-0 my-6 bg-gradient-to-b from-purple-200 via-pink-200 to-yellow-100 opacity-60" />
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">{practiceStats.practiceTime}m</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Total Practice Time</div>
          </div>
          <div className="hidden md:flex w-px mx-0 my-6 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-100 opacity-50" />
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{practiceStats.practiceAvgScore}</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Avg. Score</div>
          </div>
          <div className="hidden md:flex w-px mx-0 my-6 bg-gradient-to-b from-orange-200 via-red-200 to-pink-100 opacity-40" />
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">{practiceStats.practiceRatingGain > 0 ? `+${practiceStats.practiceRatingGain}` : practiceStats.practiceRatingGain}</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Rating Gain</div>
          </div>
        </motion.div>

        {/* Fancy separator */}
        <div className="flex justify-center mb-12">
          <hr className="w-1/2 h-0.5 rounded-full border-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 opacity-50" />
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-8 mb-8 max-w-3xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full px-6 py-4 pl-14 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 text-lg shadow-sm backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Difficulty Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
          className="w-full"
        >
          {filteredTopics.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No topics found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery 
                  ? `No topics match "${searchQuery}" with the current filters.`
                  : 'No topics match the current difficulty filter.'
                }
              </p>
              {(searchQuery || selectedDifficulty !== 'intermediate') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDifficulty('intermediate');
                  }}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="w-full">
              {/* Responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {filteredTopics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="p-4 md:p-5 lg:p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(topic.difficulty)}`}>
                          {topic.difficulty === 'beginner' && '🌱'}
                          {topic.difficulty === 'intermediate' && '⚡'}
                          {topic.difficulty === 'advanced' && '🔥'} {topic.difficulty}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{topic.estimatedTime}m</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
                        {topic.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed flex-grow line-clamp-3">
                        {topic.description}
                      </p>

                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Personality:
                        </div>
                        <div className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">
                          {topic.aiPersonality}
                        </div>
                      </div>

                      <div className="space-y-2 mt-auto">
                        <button
                          onClick={() => startPractice(topic)}
                          disabled={isCreatingPractice}
                          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-none disabled:opacity-50"
                        >
                          {isCreatingPractice && selectedTopic?.id === topic.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Creating...
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
                          className="w-full border border-purple-100 dark:border-purple-700 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 text-xs font-medium shadow-none"
                        >
                          {showTips ? '🙈 Hide' : '💡 Show'} Tips
                        </button>
                      </div>

                      {showTips && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-100 dark:border-yellow-700">
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-1.5 text-xs">
                            <Award className="w-3.5 h-3.5" />
                            Practice Tips:
                          </h4>
                          <ul className="space-y-1">
                            {topic.tips.map((tip, index) => (
                              <li key={index} className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-1.5">
                                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                                <span className="flex-1">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
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

      {/* Practice Settings Modal */}
      {pendingTopic && (
        <PracticeSettingsModal
          isOpen={showSettingsModal}
          onClose={handleCloseSettingsModal}
          onStart={createPracticeWithSettings}
          topic={{
            title: pendingTopic.title,
            category: pendingTopic.category,
            difficulty: pendingTopic.difficulty
          }}
        />
      )}
      <Footer />
    </div>
  );
};

export default PracticePage;
