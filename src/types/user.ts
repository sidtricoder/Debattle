import { UserPreferences, UserStats } from './auth';
import { DebateStats } from './debate';
import { Achievement, NotificationType } from './global';

// Define missing types locally
export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks: SocialLinks;
  rating: number;
  tier: UserTier;
  level: number;
  xp: number;
  nextLevelXp: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  achievements: Achievement[];
  badges: Badge[];
  preferences: UserPreferences;
  stats: UserStats;
  debateStats: DebateStats;
  friends: string[];
  blockedUsers: string[];
  isOnline: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isPremium: boolean;
  subscriptionExpiry?: Date;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  discord?: string;
  youtube?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  data?: Record<string, any>;
  timestamp: Date;
  isPublic: boolean;
}

export type ActivityType = 
  | 'debate_won'
  | 'debate_lost'
  | 'achievement_unlocked'
  | 'rank_up'
  | 'rank_down'
  | 'friend_added'
  | 'tournament_joined'
  | 'tournament_won'
  | 'streak_milestone'
  | 'profile_updated';

export interface UserRelationship {
  userId: string;
  targetUserId: string;
  type: RelationshipType;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type RelationshipType = 'friend' | 'blocked' | 'following';
export type RelationshipStatus = 'pending' | 'accepted' | 'declined' | 'active';

export interface UserSearch {
  query: string;
  filters: UserSearchFilters;
  results: UserSearchResult[];
  total: number;
}

export interface UserSearchFilters {
  tier?: UserTier[];
  ratingRange?: [number, number];
  isOnline?: boolean;
  hasDebated?: boolean;
  location?: string;
  language?: string;
}

export interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  tier: UserTier;
  wins: number;
  losses: number;
  isOnline: boolean;
  lastActive: Date;
  mutualFriends: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
}

export interface UserSettings {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  display: DisplaySettings;
  gameplay: GameplaySettings;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  allowDebateInvites: boolean;
  showDebateHistory: boolean;
  showAchievements: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  debateInvites: boolean;
  friendRequests: boolean;
  achievements: boolean;
  rankChanges: boolean;
  tournaments: boolean;
  systemUpdates: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  animationsEnabled: boolean;
  soundEffectsEnabled: boolean;
}

export interface GameplaySettings {
  autoAcceptRatedDebates: boolean;
  preferredTopics: string[];
  avoidedTopics: string[];
  maxRatingDifference: number;
  preferredTimePerTurn: number;
  allowSpectators: boolean;
  autoSaveArguments: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  features: PremiumFeature[];
}

export type SubscriptionPlan = 'free' | 'premium' | 'pro' | 'elite';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'suspended';

export type PremiumFeature = 
  | 'unlimited_debates'
  | 'priority_matchmaking'
  | 'advanced_analytics'
  | 'custom_themes'
  | 'tournament_access'
  | 'ai_coaching'
  | 'video_replays'
  | 'exclusive_badges';

export interface UserAnalytics {
  userId: string;
  period: AnalyticsPeriod;
  debatesPlayed: number;
  winRate: number;
  averageScore: number;
  topicPerformance: TopicPerformance[];
  ratingHistory: RatingPoint[];
  activityHeatmap: ActivityPoint[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface TopicPerformance {
  topic: string;
  debates: number;
  wins: number;
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface RatingPoint {
  date: Date;
  rating: number;
  change: number;
  reason: string;
}

export interface ActivityPoint {
  date: Date;
  debates: number;
  timeSpent: number;
  score: number;
}