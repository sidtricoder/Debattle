import { create } from 'zustand';
import { firestore } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

export interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  tags: string[];
  trending: boolean;
  usageCount: number;
  averageRating: number;
  isOfficial: boolean;
  createdAt: number;
  createdBy?: string;
}

export interface TopicFilter {
  category?: string;
  difficulty?: number;
  trending?: boolean;
  search?: string;
}

interface TopicsState {
  topics: DebateTopic[];
  categories: string[];
  trendingTopics: DebateTopic[];
  selectedTopic: DebateTopic | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTopics: () => Promise<void>;
  createCustomTopic: (topic: Omit<DebateTopic, 'id' | 'createdAt'>) => Promise<string>;
  updateTopicUsage: (topicId: string) => Promise<void>;
  rateTopic: (topicId: string, rating: number) => Promise<void>;
  getTopicsByCategory: (category: string) => Promise<DebateTopic[]>;
  getTopicsByDifficulty: (difficulty: number) => Promise<DebateTopic[]>;
  searchTopics: (query: string) => Promise<DebateTopic[]>;
  getTrendingTopics: (limit?: number) => Promise<DebateTopic[]>;
  selectTopic: (topic: DebateTopic | null) => void;
}

export const useTopicsStore = create<TopicsState>((set, get) => ({
  topics: [],
  categories: ['technology', 'business', 'education', 'society', 'science', 'economics', 'politics', 'philosophy'],
  trendingTopics: [],
  selectedTopic: null,
  isLoading: false,
  error: null,

  loadTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const topicsQuery = query(
        collection(firestore, 'topics'),
        orderBy('createdAt', 'desc')
      );
      const topicsSnapshot = await getDocs(topicsQuery);
      const topics = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DebateTopic[];
      
      const trending = topics
        .filter(topic => topic.trending)
        .sort((a, b) => b.usageCount - a.usageCount);
      
      set({ 
        topics,
        trendingTopics: trending,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load topics',
        isLoading: false 
      });
    }
  },

  createCustomTopic: async (topicData) => {
    set({ isLoading: true, error: null });
    try {
      const newTopic = {
        ...topicData,
        createdAt: Date.now(),
        usageCount: 0,
        averageRating: 0,
        trending: false,
        isOfficial: false
      };

      const topicRef = await addDoc(collection(firestore, 'topics'), newTopic);
      
      const createdTopic: DebateTopic = {
        ...newTopic,
        id: topicRef.id
      };

      set(state => ({
        topics: [...state.topics, createdTopic],
        isLoading: false
      }));

      return topicRef.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTopicUsage: async (topicId) => {
    try {
      const topicRef = doc(firestore, 'topics', topicId);
      const topicDoc = await getDoc(topicRef);
      
      if (!topicDoc.exists()) {
        throw new Error('Topic not found');
      }
      
      const topic = topicDoc.data() as DebateTopic;
      const updatedUsageCount = topic.usageCount + 1;
      
      await updateDoc(topicRef, { usageCount: updatedUsageCount });
      
      set(state => ({
        topics: state.topics.map(t => 
          t.id === topicId ? { ...t, usageCount: updatedUsageCount } : t
        ),
        trendingTopics: state.trendingTopics.map(t => 
          t.id === topicId ? { ...t, usageCount: updatedUsageCount } : t
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  rateTopic: async (topicId, rating) => {
    try {
      const topicRef = doc(firestore, 'topics', topicId);
      const topicDoc = await getDoc(topicRef);
      
      if (!topicDoc.exists()) {
        throw new Error('Topic not found');
      }
      
      const topic = topicDoc.data() as DebateTopic;
      const newUsageCount = topic.usageCount + 1;
      const newAverageRating = (topic.averageRating * topic.usageCount + rating) / newUsageCount;
      
      await updateDoc(topicRef, { 
        averageRating: newAverageRating,
        usageCount: newUsageCount
      });
      
      set(state => ({
        topics: state.topics.map(t => 
          t.id === topicId ? { ...t, averageRating: newAverageRating, usageCount: newUsageCount } : t
        ),
        trendingTopics: state.trendingTopics.map(t => 
          t.id === topicId ? { ...t, averageRating: newAverageRating, usageCount: newUsageCount } : t
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getTopicsByCategory: async (category) => {
    try {
      const topicsQuery = query(
        collection(firestore, 'topics'),
        where('category', '==', category),
        orderBy('usageCount', 'desc')
      );
      const topicsSnapshot = await getDocs(topicsQuery);
      return topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DebateTopic[];
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getTopicsByDifficulty: async (difficulty) => {
    try {
      const topicsQuery = query(
        collection(firestore, 'topics'),
        where('difficulty', '==', difficulty),
        orderBy('usageCount', 'desc')
      );
      const topicsSnapshot = await getDocs(topicsQuery);
      return topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DebateTopic[];
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  searchTopics: async (searchQuery) => {
    try {
      // Firestore doesn't support full-text search, so we'll fetch all topics and filter client-side
      // In a production app, you'd use Algolia or similar for full-text search
      const topicsQuery = query(collection(firestore, 'topics'));
      const topicsSnapshot = await getDocs(topicsQuery);
      const allTopics = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DebateTopic[];
      
      const lowercaseQuery = searchQuery.toLowerCase();
      return allTopics.filter(topic => 
        topic.title.toLowerCase().includes(lowercaseQuery) ||
        topic.description.toLowerCase().includes(lowercaseQuery) ||
        topic.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getTrendingTopics: async (limitCount = 10) => {
    try {
      const trendingQuery = query(
        collection(firestore, 'topics'),
        where('trending', '==', true),
        orderBy('usageCount', 'desc'),
        limit(limitCount)
      );
      const topicsSnapshot = await getDocs(trendingQuery);
      return topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DebateTopic[];
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  selectTopic: (topic) => {
    set({ selectedTopic: topic });
  }
})); 