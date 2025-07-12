import { create } from 'zustand';
import { firestore } from '../lib/firebase';
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
  Timestamp
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
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  arguments: DebateArgument[];
  currentTurn: string;
  timeRemaining: number;
  maxRounds: number;
  currentRound: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  judgment?: {
    winner: string;
    scores: Record<string, number>;
    feedback: Record<string, string[]>;
    reasoning: string;
    fallaciesDetected: string[];
    highlights: string[];
  };
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
  
  // Real-time simulation
  simulateTyping: (debateId: string, userId: string, isTyping: boolean) => Promise<void>;
  simulatePresence: (debateId: string, userId: string, isOnline: boolean) => Promise<void>;
}

export const useDebateStore = create<DebateState>((set, get) => ({
  currentDebate: null,
  debatesHistory: [],
  queue: [],
  isLoading: false,
  error: null,

  createDebate: async (topic, category, difficulty) => {
    set({ isLoading: true, error: null });
    try {
      const debateRef = await addDoc(collection(firestore, 'debates'), {
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
        createdAt: serverTimestamp(),
        metadata: {
          totalArguments: 0,
          debateDuration: 0
        }
      });
      
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
        createdAt: Date.now(),
        metadata: {
          totalArguments: 0,
          debateDuration: 0
        }
      };
      
      set(state => ({
        debatesHistory: [...state.debatesHistory, newDebate],
        isLoading: false
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
      const participant: DebateParticipant = {
        userId,
        displayName: `User ${userId.slice(-4)}`,
        rating: 1000,
        stance,
        isOnline: true,
        isTyping: false,
        lastSeen: Date.now()
      };

      const updatedDebate = {
        ...debate,
        participants: [...debate.participants, participant],
        status: (debate.participants.length === 1 ? 'active' : 'waiting') as 'waiting' | 'active' | 'completed' | 'abandoned',
        startedAt: debate.participants.length === 1 ? Date.now() : debate.startedAt
      };

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
      const argument: DebateArgument = {
        id: `arg_${Date.now()}`,
        userId,
        content,
        timestamp: Date.now(),
        round: debate.currentRound,
        wordCount: content.split(' ').length
      };

      const updatedDebate = {
        ...debate,
        arguments: [...debate.arguments, argument],
        currentTurn: debate.participants.find(p => p.userId !== userId)?.userId || '',
        currentRound: debate.arguments.length % 2 === 0 ? debate.currentRound + 1 : debate.currentRound,
        metadata: {
          ...debate.metadata,
          totalArguments: debate.arguments.length + 1
        }
      };

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
      const updatedDebate = {
        ...debate,
        status: 'completed' as const,
        endedAt: Date.now(),
        judgment,
        metadata: {
          ...debate.metadata,
          debateDuration: Date.now() - (debate.startedAt || debate.createdAt)
        }
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
      const debatesQuery = query(
        collection(firestore, 'debates'),
        where('participants', 'array-contains', { userId }),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const debatesSnapshot = await getDocs(debatesQuery);
      const debates = debatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Debate[];
      
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
        return null;
      }
      
      return { id: debateDoc.id, ...debateDoc.data() } as Debate;
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