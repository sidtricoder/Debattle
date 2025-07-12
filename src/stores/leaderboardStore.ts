import { create } from 'zustand';
import { firestore } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  rating: number;
  rank: number;
  change: number;
  gamesPlayed: number;
  tier: string;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  lastActive: number;
  region?: string;
  category?: string;
}

export interface LeaderboardFilter {
  category?: string;
  region?: string;
  tier?: string;
  timeRange?: 'all' | 'month' | 'week' | 'day';
}

interface LeaderboardState {
  globalLeaderboard: LeaderboardEntry[];
  categoryLeaderboards: Record<string, LeaderboardEntry[]>;
  regionalLeaderboards: Record<string, LeaderboardEntry[]>;
  userRank: LeaderboardEntry | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadLeaderboard: (filter?: LeaderboardFilter) => Promise<void>;
  getUserRank: (userId: string) => Promise<LeaderboardEntry | null>;
  updateUserStats: (userId: string, stats: Partial<LeaderboardEntry>) => Promise<void>;
  getTopPlayers: (limit?: number, filter?: LeaderboardFilter) => Promise<LeaderboardEntry[]>;
  getRisingStars: (limit?: number) => Promise<LeaderboardEntry[]>;
  getCategoryLeaders: (category: string, limit?: number) => Promise<LeaderboardEntry[]>;
  getRegionalLeaders: (region: string, limit?: number) => Promise<LeaderboardEntry[]>;
}

const getTierFromRating = (rating: number): string => {
  if (rating >= 2000) return 'Master';
  if (rating >= 1800) return 'Diamond';
  if (rating >= 1600) return 'Platinum';
  if (rating >= 1400) return 'Gold';
  if (rating >= 1200) return 'Silver';
  return 'Bronze';
};

const calculateWinRate = (wins: number, losses: number): number => {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
};

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  globalLeaderboard: [],
  categoryLeaderboards: {},
  regionalLeaderboards: {},
  userRank: null,
  isLoading: false,
  error: null,

  loadLeaderboard: async (filter) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch all users from Firestore
      const usersQuery = query(
        collection(firestore, 'users'),
        orderBy('rating', 'desc')
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      const users = usersSnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          userId: doc.id,
          displayName: userData.displayName || 'Anonymous',
          rating: userData.rating || 1000,
          rank: 0, // Will be calculated below
          change: userData.ratingChange || 0,
          gamesPlayed: (userData.wins || 0) + (userData.losses || 0) + (userData.draws || 0),
          tier: getTierFromRating(userData.rating || 1000),
          wins: userData.wins || 0,
          losses: userData.losses || 0,
          winRate: calculateWinRate(userData.wins || 0, userData.losses || 0),
          streak: userData.winStreak || 0,
          lastActive: userData.lastActive || Date.now(),
          region: userData.region || 'Global',
          category: userData.preferredCategory || 'general'
        } as LeaderboardEntry;
      });

      let filtered = [...users];

      if (filter?.category) {
        filtered = filtered.filter(entry => entry.category === filter.category);
      }

      if (filter?.region) {
        filtered = filtered.filter(entry => entry.region === filter.region);
      }

      if (filter?.tier) {
        filtered = filtered.filter(entry => entry.tier === filter.tier);
      }

      if (filter?.timeRange && filter.timeRange !== 'all') {
        const now = Date.now();
        const ranges = {
          day: 86400000,
          week: 86400000 * 7,
          month: 86400000 * 30
        };
        const cutoff = now - ranges[filter.timeRange];
        filtered = filtered.filter(entry => entry.lastActive > cutoff);
      }

      // Update ranks
      filtered = filtered
        .sort((a, b) => b.rating - a.rating)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      set({ 
        globalLeaderboard: filtered,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load leaderboard',
        isLoading: false 
      });
    }
  },

  getUserRank: async (userId) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      const { globalLeaderboard } = get();
      
      // Find user in current leaderboard
      const userEntry = globalLeaderboard.find(entry => entry.userId === userId);
      
      if (userEntry) {
        return userEntry;
      }
      
      // If not in current leaderboard, create entry
      return {
        userId,
        displayName: userData.displayName || 'Anonymous',
        rating: userData.rating || 1000,
        rank: 0,
        change: userData.ratingChange || 0,
        gamesPlayed: (userData.wins || 0) + (userData.losses || 0) + (userData.draws || 0),
        tier: getTierFromRating(userData.rating || 1000),
        wins: userData.wins || 0,
        losses: userData.losses || 0,
        winRate: calculateWinRate(userData.wins || 0, userData.losses || 0),
        streak: userData.winStreak || 0,
        lastActive: userData.lastActive || Date.now(),
        region: userData.region || 'Global',
        category: userData.preferredCategory || 'general'
      } as LeaderboardEntry;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateUserStats: async (userId, stats) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, stats);
      
      // Reload leaderboard to reflect changes
      await get().loadLeaderboard();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getTopPlayers: async (limitCount = 10, filter) => {
    try {
      const { globalLeaderboard } = get();
      let filtered = [...globalLeaderboard];

      if (filter?.category) {
        filtered = filtered.filter(entry => entry.category === filter.category);
      }

      if (filter?.region) {
        filtered = filtered.filter(entry => entry.region === filter.region);
      }

      return filtered.slice(0, limitCount);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getRisingStars: async (limitCount = 10) => {
    try {
      const { globalLeaderboard } = get();
      return globalLeaderboard
        .filter(entry => entry.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, limitCount);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getCategoryLeaders: async (category, limitCount = 10) => {
    try {
      const { globalLeaderboard } = get();
      return globalLeaderboard
        .filter(entry => entry.category === category)
        .slice(0, limitCount);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getRegionalLeaders: async (region, limitCount = 10) => {
    try {
      const { globalLeaderboard } = get();
      return globalLeaderboard
        .filter(entry => entry.region === region)
        .slice(0, limitCount);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
})); 