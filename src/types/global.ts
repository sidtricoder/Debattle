export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  difficulty?: string;
  rating?: [number, number];
  dateRange?: [Date, Date];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'debate_invite'
  | 'debate_start'
  | 'debate_end'
  | 'achievement_unlocked'
  | 'rank_change'
  | 'tournament_start'
  | 'system_announcement'
  | 'friend_request'
  | 'challenge_received'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'challenge_expired';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  reward: AchievementReward;
  isSecret: boolean;
  unlockedBy: string[];
}

export interface AchievementRequirement {
  type: 'wins' | 'debates' | 'streak' | 'rating' | 'topic' | 'time';
  value: number | string;
  operator: 'gte' | 'lte' | 'eq' | 'in';
}

export interface AchievementReward {
  xp: number;
  badge?: string;
  title?: string;
  special?: string;
}

export type AchievementCategory = 
  | 'participation'
  | 'skill'
  | 'social'
  | 'special'
  | 'seasonal';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  tier: string;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  change: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  autoAcceptFriends: boolean;
  showOnlineStatus: boolean;
  allowSpectators: boolean;
  preferredLanguage: string;
  timezone: string;
}

export interface SystemStatus {
  online: boolean;
  maintenance: boolean;
  version: string;
  lastUpdate: Date;
  activeUsers: number;
  activeDebates: number;
  serverHealth: 'healthy' | 'degraded' | 'down';
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  action?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: Record<string, any>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    tournaments: boolean;
    spectatorMode: boolean;
    voiceChat: boolean;
    videoChat: boolean;
    aiJudging: boolean;
  };
  limits: {
    maxDebateTime: number;
    maxArgumentLength: number;
    maxSpectators: number;
    maxFriends: number;
  };
}

export interface PresenceData {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activity?: string;
  lastSeen: Date;
  location?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected?: Date;
  retryCount: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState<T = Record<string, any>> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}