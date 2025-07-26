import { create } from 'zustand';
import { firestore } from '../lib/firebase';
import { useAuthStore } from './authStore';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
  increment,
  arrayUnion
} from 'firebase/firestore';

export interface DebateParticipant {
  userId: string;
  displayName: string;
  rating: number;
  stance: 'pro' | 'con';
  isOnline: boolean;
  isTyping: boolean;
  lastSeen: number;
}

export interface DebateArgument {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  round: number;
  wordCount: number;
  aiFeedback?: {
    strengthScore: number;
    clarityScore: number;
    evidenceScore: number;
    feedback: string;
  };
}

export interface Debate {
  id: string;
  topic: string;
  category: string;
  difficulty: number;
  participants: DebateParticipant[];
  participantIds: string[];
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  arguments: DebateArgument[];
  currentTurn: string;
  timeRemaining: number;
  maxRounds: number;
  currentRound: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  isPractice?: boolean;
  practiceSettings?: {
    aiProvider: 'gemini' | 'llama' | 'gemma';
    timeoutSeconds: number;
    numberOfRounds: number;
    userStance: 'pro' | 'con';
  };
  aiPersonality?: string;
  practiceTips?: string[];
  judgment?: {
    winner: string;
    scores: Record<string, number>;
    feedback: Record<string, string[]>;
    reasoning: string;
    fallaciesDetected: string[];
    highlights: string[];
  };
  ratings?: Record<string, number>;
  ratingChanges?: Record<string, number>;
  metadata: {
    totalArguments: number;
    debateDuration: number;
    audienceVotes?: Record<string, number>;
  };
}

export interface QueueEntry {
  userId: string;
  preferences: {
    topics: string[];
    difficulty: number;
    timeLimit: number;
  };
  joinedAt: number;
  estimatedWait: number;
}

interface DebateState {
  currentDebate: Debate | null;
  debatesHistory: Debate[];
  queue: QueueEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createDebate: (topic: string, category: string, difficulty: number) => Promise<string>;
  joinDebate: (debateId: string, userId: string, stance: 'pro' | 'con') => Promise<void>;
  leaveDebate: (debateId: string, userId: string) => Promise<void>;
  submitArgument: (debateId: string, userId: string, content: string) => Promise<void>;
  updateParticipantStatus: (debateId: string, userId: string, status: Partial<DebateParticipant>) => Promise<void>;
  endDebate: (debateId: string, judgment: Debate['judgment']) => Promise<void>;
  
  // Queue management
  joinQueue: (userId: string, preferences: QueueEntry['preferences']) => Promise<void>;
  leaveQueue: (userId: string) => Promise<void>;
  findMatch: (userId: string) => Promise<Debate | null>;
  
  // History
  loadDebateHistory: (userId: string) => Promise<void>;
  getDebateById: (debateId: string) => Promise<Debate | null>;
  simulateTyping: (debateId: string, userId: string, isTyping: boolean) => Promise<void>;
  simulatePresence: (debateId: string, userId: string, isOnline: boolean) => Promise<void>;
  incrementTopicUsage: (topicTitle: string) => Promise<boolean>;
}

export const useDebateStore = create<DebateState>((set, get) => ({
  currentDebate: null,
  debatesHistory: [],
  queue: [],
  isLoading: false,
  error: null,

  incrementTopicUsage: async (topicTitle: string) => {
    try {
      // Find the topic by title (case insensitive)
      const topicsQuery = query(
        collection(firestore, 'topics'),
        where('title', '>=', topicTitle),
        where('title', '<=', topicTitle + '\uf8ff'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(topicsQuery);
      
      if (!querySnapshot.empty) {
        const topicDoc = querySnapshot.docs[0];
        const topicRef = doc(firestore, 'topics', topicDoc.id);
        
        // Use increment to atomically update the usageCount
        await updateDoc(topicRef, {
          usageCount: increment(1)
        });
        
        console.log(`Incremented usage count for topic: ${topicTitle}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error incrementing topic usage:', error);
      return false;
    }
  },

  createDebate: async (topic, category, difficulty) => {
    set({ isLoading: true, error: null });
    try {
      // Increment the topic's usage count
      await get().incrementTopicUsage(topic);
      
      const debateData = {
        topic,
        category,
        difficulty,
        participants: [],
        participantIds: [],
        status: 'waiting',
        arguments: [],
        currentTurn: '',
        timeRemaining: 3600,
        maxRounds: 6,
        currentRound: 1,
        createdAt: Date.now(), // always use integer timestamp
        metadata: {
          totalArguments: 0,
          debateDuration: 0
        }
      };
      
      const debateRef = await addDoc(collection(firestore, 'debates'), debateData);
      
      const newDebate: Debate = {
        id: debateRef.id,
        topic,
        category,
        difficulty,
        participants: [],
        status: 'waiting',
        arguments: [],
        currentTurn: '',
        timeRemaining: 3600,
        maxRounds: 6,
        currentRound: 1,
        createdAt: debateData.createdAt,
        metadata: {
          totalArguments: 0,
          debateDuration: 0
        },
        participantIds: []
      };
      
      console.log('Created new debate:', newDebate);
      
      set(state => ({
        debatesHistory: [...state.debatesHistory, newDebate],
      }));
      
      return debateRef.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  joinDebate: async (debateId, userId, stance) => {
    set({ isLoading: true, error: null });
    try {
      const debateRef = doc(firestore, 'debates', debateId);
      const debateDoc = await getDoc(debateRef);
      
      if (!debateDoc.exists()) {
        throw new Error('Debate not found');
      }
      
      const debate = debateDoc.data() as Debate;
      
      // Get user's display name and rating from Firestore if not AI
      let displayName = `User ${userId.slice(-4)}`; // Default fallback
      let rating = 1000; // Default fallback
      if (userId !== 'ai_opponent') {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            displayName = userData.displayName || userData.username || `User ${userId.slice(-4)}`;
            rating = userData.rating || 1000;
          }
        } catch (error) {
          console.warn('Failed to fetch user display name or rating:', error);
          displayName = `User ${userId.slice(-4)}`;
        }
      } else {
        displayName = 'AI Opponent';
        rating = 1200;
      }
      
      const participant: DebateParticipant = {
        userId,
        displayName,
        rating,
        stance,
        isOnline: true,
        isTyping: false,
        lastSeen: Date.now()
      };

      const currentTime = Date.now();
      // Always update participant info
      let newParticipants = debate.participants.filter(p => p.userId !== userId);
      newParticipants.push(participant);
      let newStatus = debate.status;
      if (debate.isPractice && newParticipants.some(p => p.userId === 'ai_opponent') && newParticipants.length >= 2) {
        newStatus = 'active';
      } else if (newParticipants.length === 2) {
        newStatus = 'active';
      }

      const newParticipantIds = newParticipants.map(p => p.userId);
      let newCurrentTurn = debate.currentTurn;
      if (newParticipants.length === 2) {
        const proParticipant = newParticipants.find(p => p.stance === 'pro');
        if (proParticipant) {
          newCurrentTurn = proParticipant.userId;
        }
      } else if (debate.participants.length === 0) {
        newCurrentTurn = userId;
      }

      const updatedDebate: any = {
        ...debate,
        participants: newParticipants,
        participantIds: newParticipantIds,
        status: newStatus,
        currentTurn: newCurrentTurn
      };
      
      if (debate.participants.length === 1 && currentTime && typeof currentTime === 'number' && !isNaN(currentTime)) {
        updatedDebate.startedAt = currentTime;
      }

      await updateDoc(debateRef, updatedDebate);
      
      set(state => ({
        debatesHistory: state.debatesHistory.map(d => 
          d.id === debateId ? updatedDebate : d
        ),
        currentDebate: state.currentDebate?.id === debateId ? updatedDebate : state.currentDebate,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  leaveDebate: async (debateId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const debateRef = doc(firestore, 'debates', debateId);
      const debateDoc = await getDoc(debateRef);
      
      if (!debateDoc.exists()) {
        throw new Error('Debate not found');
      }
      
      const debate = debateDoc.data() as Debate;
      const updatedDebate = {
        ...debate,
        participants: debate.participants.filter(p => p.userId !== userId),
        status: (debate.participants.length <= 1 ? 'abandoned' : debate.status) as 'waiting' | 'active' | 'completed' | 'abandoned'
      };

      await updateDoc(debateRef, updatedDebate);
      
      set(state => ({
        debatesHistory: state.debatesHistory.map(d => 
          d.id === debateId ? updatedDebate : d
        ),
        currentDebate: state.currentDebate?.id === debateId ? null : state.currentDebate,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  submitArgument: async (debateId, userId, content) => {
    set({ isLoading: true, error: null });
    try {
      const debateRef = doc(firestore, 'debates', debateId);
      const debateDoc = await getDoc(debateRef);
      
      if (!debateDoc.exists()) {
        throw new Error('Debate not found');
      }
      
      const debate = debateDoc.data() as Debate;
      console.log('[DEBUG] submitArgument: loaded debate', debate);
      const argument: DebateArgument = {
        id: `arg_${Date.now()}`,
        userId,
        content,
        timestamp: Date.now(),
        round: debate.currentRound,
        wordCount: content.split(' ').length
      };

      // Practice mode logic: alternate turns between user and AI and update rounds
      let nextTurn = debate.participants.find(p => p.userId !== userId)?.userId || '';
      let nextRound = debate.currentRound;
      const maxRounds = debate.practiceSettings?.numberOfRounds || 3;
      
      // In practice mode, manage turns and rounds
      if (debate.isPractice) {
        if (userId !== 'ai_opponent') {
          // User just submitted, it's the AI's turn
          nextTurn = 'ai_opponent';
          
          // If this was the last round and user just submitted, end the debate
          if (debate.currentRound >= maxRounds) {
            console.log(`[DEBUG] Final round completed. Preparing to end debate.`);
            // The debate will be ended by the component based on total arguments
          }
        } else {
          // AI just submitted, it's the user's turn
          const realUser = debate.participants.find(p => p.userId !== 'ai_opponent');
          nextTurn = realUser?.userId || '';
          
          // Increment round after both have gone (when AI is done)
          // But only if we haven't reached max rounds
          if (debate.currentRound < maxRounds) {
            nextRound = debate.currentRound + 1;
            console.log(`[DEBUG] Round incremented to: ${nextRound}`);
          }
        }
        console.log(`[DEBUG] Turn switched to: ${nextTurn}, current round: ${nextRound}/${maxRounds}`);
      }

      const updatedDebate = {
        ...debate,
        arguments: [...debate.arguments, argument],
        currentTurn: nextTurn,
        currentRound: nextRound,
        participantIds: debate.participants.map(p => p.userId),
        metadata: {
          ...debate.metadata,
          totalArguments: debate.arguments.length + 1
        }
      };
      console.log('[DEBUG] submitArgument: updatedDebate', updatedDebate);
      await updateDoc(debateRef, updatedDebate);
      
      set(state => ({
        debatesHistory: state.debatesHistory.map(d => 
          d.id === debateId ? updatedDebate : d
        ),
        currentDebate: state.currentDebate?.id === debateId ? updatedDebate : state.currentDebate,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateParticipantStatus: async (debateId, userId, status) => {
    try {
      const debateRef = doc(firestore, 'debates', debateId);
      const debateDoc = await getDoc(debateRef);
      
      if (!debateDoc.exists()) {
        throw new Error('Debate not found');
      }
      
      const debate = debateDoc.data() as Debate;
      const participantIndex = debate.participants.findIndex(p => p.userId === userId);
      if (participantIndex === -1) return;

      const updatedParticipants = [...debate.participants];
      updatedParticipants[participantIndex] = { ...updatedParticipants[participantIndex], ...status };

      const updatedDebate = { ...debate, participants: updatedParticipants };
      await updateDoc(debateRef, updatedDebate);
      
      set(state => ({
        debatesHistory: state.debatesHistory.map(d => 
          d.id === debateId ? updatedDebate : d
        ),
        currentDebate: state.currentDebate?.id === debateId ? updatedDebate : state.currentDebate
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  endDebate: async (debateId, judgment) => {
    set({ isLoading: true, error: null });
    try {
      const debateRef = doc(firestore, 'debates', debateId);
      const debateDoc = await getDoc(debateRef);
      
      if (!debateDoc.exists()) {
        throw new Error('Debate not found');
      }
      
      const debate = debateDoc.data() as Debate;
      const endTime = Date.now();
      // Use startedAt if available, otherwise fall back to createdAt
      const startTime = debate.startedAt || debate.createdAt;
      
      // Calculate rating changes if this is a user vs user debate (not practice)
      let ratingChanges: Record<string, number> | undefined = undefined;
      if (debate.participants.length === 2 && 
          !debate.participants.some(p => p.userId === 'ai_opponent') &&
          judgment?.winner) {
        // For user vs user debates, calculate rating changes
        // Note: This is a simplified calculation - in a real app you'd use ELO
        ratingChanges = {} as Record<string, number>;
        for (const participant of debate.participants) {
          const isWinner = participant.userId === judgment.winner;
          const isLoser = judgment.winner && participant.userId !== judgment.winner;
          
          if (isWinner) {
            ratingChanges[participant.userId] = 16; // +16 for win
          } else if (isLoser) {
            ratingChanges[participant.userId] = -16; // -16 for loss
          } else {
            ratingChanges[participant.userId] = 0; // 0 for draw
          }
        }
      }
      
      const updatedDebate = {
        ...debate,
        status: 'completed' as const,
        endedAt: endTime,
        judgment,
        ...(ratingChanges && { ratingChanges }),
        participantIds: debate.participants.map(p => p.userId),
        metadata: {
          ...debate.metadata,
          debateDuration: endTime - startTime
        }
      };
      
      console.log('[DEBUG] endDebate: updatedDebate', updatedDebate);
      await updateDoc(debateRef, updatedDebate);

      // Update user stats for all participants
      if (debate.participants && Array.isArray(debate.participants)) {
        for (const participant of debate.participants) {
          const userRef = doc(firestore, 'users', participant.userId);
          await runTransaction(firestore, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return;
            const userData = userSnap.data();
            let wins = userData.wins || 0;
            let losses = userData.losses || 0;
            let draws = userData.draws || 0;
            let gamesPlayed = userData.gamesPlayed || 0;
            let rating = userData.rating || 1200;
            // Determine result for this participant
            let isDraw = false;
            let isWin = false;
            let isLoss = false;
            let winnerId = judgment && judgment.winner;
            // Patch: If winnerId is a displayName, map to userId
            if (winnerId && !debate.participants.some(p => p.userId === winnerId)) {
              const match = debate.participants.find(p => p.displayName === winnerId);
              if (match) winnerId = match.userId;
            }
            if (judgment && winnerId) {
              if (winnerId === 'Draw' || winnerId === 'draw') {
                isDraw = true;
              } else if (winnerId === participant.userId) {
                isWin = true;
              } else {
                isLoss = true;
              }
            }
            if (isDraw) {
              draws += 1;
              gamesPlayed += 1;
            } else if (isWin) {
              wins += 1;
              gamesPlayed += 1;
            } else if (isLoss) {
              losses += 1;
              gamesPlayed += 1;
            }
            // Update rating if available
            if (updatedDebate.ratings && updatedDebate.ratings[participant.userId] !== undefined) {
              rating = updatedDebate.ratings[participant.userId];
            }
            // Calculate win_rate
            const win_rate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
            // Optionally, set provisionalRating to false after 5 games
            let provisionalRating = userData.provisionalRating;
            if (gamesPlayed >= 5) provisionalRating = false;
            
            // Prepare the update object
            const updateData: any = {
              wins,
              losses,
              draws,
              gamesPlayed,
              win_rate,
              rating,
              last_active: new Date(),
              updated_at: new Date(),
              provisionalRating
            };

            // Update practice stats if this is a practice debate
            if (debate.isPractice) {
              // Use increment operations for atomic updates
              updateData.practiceSessions = increment(1);
              
              // Calculate practice time in minutes and increment
              const debateDuration = Math.round((endTime - startTime) / (1000 * 60));
              updateData.practiceTime = increment(debateDuration);
              
              // Handle average score update
              if (judgment?.scores?.[participant.userId] !== undefined || judgment?.scores?.[participant.displayName] !== undefined) {
                const currentScore = judgment.scores?.[participant.userId] || judgment.scores?.[participant.displayName];
                if (typeof currentScore === 'number') {
                  // Calculate new average score
                  const currentTotal = (userData.practiceAvgScore || 0) * (userData.practiceSessions || 0);
                  const newTotal = currentTotal + currentScore;
                  const newAverage = newTotal / ((userData.practiceSessions || 0) + 1);
                  updateData.practiceAvgScore = parseFloat(newAverage.toFixed(2));
                }
              } else {
                // Keep existing average score if no new score
                updateData.practiceAvgScore = userData.practiceAvgScore || 0;
              }
              
              // Update rating gain if there are rating changes
              if (updatedDebate.ratingChanges?.[participant.userId] !== undefined) {
                updateData.practiceRatingGain = increment(updatedDebate.ratingChanges[participant.userId]);
              } else {
                // If no rating change, ensure we don't overwrite existing value
                updateData.practiceRatingGain = userData.practiceRatingGain || 0;
              }
            } else {
              // If not a practice debate, keep existing practice stats
              updateData.practiceSessions = userData.practiceSessions || 0;
              updateData.practiceTime = userData.practiceTime || 0;
              updateData.practiceAvgScore = userData.practiceAvgScore || 0;
              updateData.practiceRatingGain = userData.practiceRatingGain || 0;
            }

            // Apply all updates in a single transaction
            transaction.update(userRef, updateData);
          });
        }
      }

      // Refresh user data to sync with Firebase
      try {
        const { refreshUserData } = useAuthStore.getState();
        await refreshUserData();
      } catch (error) {
        console.error('Failed to refresh user data after debate end:', error);
      }
      
      set(state => ({
        debatesHistory: state.debatesHistory.map(d => 
          d.id === debateId ? updatedDebate : d
        ),
        currentDebate: state.currentDebate?.id === debateId ? null : state.currentDebate,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  joinQueue: async (userId, preferences) => {
    set({ isLoading: true, error: null });
    try {
      const entry: QueueEntry = {
        userId,
        preferences,
        joinedAt: Date.now(),
        estimatedWait: 30
      };

      await addDoc(collection(firestore, 'queue'), entry);
      
      set(state => ({
        queue: [...state.queue, entry],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  leaveQueue: async (userId) => {
    try {
      const queueQuery = query(collection(firestore, 'queue'), where('userId', '==', userId));
      const queueDocs = await getDocs(queueQuery);
      
      for (const doc of queueDocs.docs) {
        await deleteDoc(doc.ref);
      }
      
      set(state => ({
        queue: state.queue.filter(q => q.userId !== userId)
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  findMatch: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // Get user's queue entry
      const userQueueQuery = query(collection(firestore, 'queue'), where('userId', '==', userId));
      const userQueueDocs = await getDocs(userQueueQuery);
      
      if (userQueueDocs.empty) {
        set({ isLoading: false });
        return null;
      }
      
      const userEntry = userQueueDocs.docs[0].data() as QueueEntry;
      
      // Find compatible opponent
      const opponentQuery = query(
        collection(firestore, 'queue'),
        where('userId', '!=', userId),
        where('preferences.difficulty', '>=', userEntry.preferences.difficulty - 1),
        where('preferences.difficulty', '<=', userEntry.preferences.difficulty + 1)
      );
      const opponentDocs = await getDocs(opponentQuery);
      
      if (opponentDocs.empty) {
        set({ isLoading: false });
        return null;
      }
      
      const opponent = opponentDocs.docs[0].data() as QueueEntry;
      
      // Create debate
      const debateId = await get().createDebate(
        userEntry.preferences.topics[0] || 'General Debate',
        'general',
        userEntry.preferences.difficulty
      );

      // Remove both users from queue
      await get().leaveQueue(userId);
      await get().leaveQueue(opponent.userId);

      // Join debate
      await get().joinDebate(debateId, userId, 'pro');
      await get().joinDebate(debateId, opponent.userId, 'con');

      const debate = await get().getDebateById(debateId);
      set({ isLoading: false });
      return debate;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadDebateHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all debates (limit to 100 for safety)
      const debatesSnapshot = await getDocs(query(collection(firestore, 'debates'), orderBy('createdAt', 'desc'), limit(100)));
      const allDebates = debatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Debate[];
      // Filter in JS for debates where user is a participant
      const debates = allDebates.filter(d => d.participants && d.participants.some(p => p.userId === userId));
      set({ debatesHistory: debates, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getDebateById: async (debateId) => {
    try {
      const debateRef = doc(firestore, 'debates', debateId);
      const debateDoc = await getDoc(debateRef);
      
      if (!debateDoc.exists()) {
        set({ currentDebate: null });
        return null;
      }
      
      const debate = { id: debateDoc.id, ...debateDoc.data() } as Debate;
      set({ currentDebate: debate });
      return debate;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  simulateTyping: async (debateId, userId, isTyping) => {
    await get().updateParticipantStatus(debateId, userId, { isTyping });
  },

  simulatePresence: async (debateId, userId, isOnline) => {
    await get().updateParticipantStatus(debateId, userId, { 
      isOnline, 
      lastSeen: isOnline ? Date.now() : Date.now() 
    });
  }
}));