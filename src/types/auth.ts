export interface User {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  photoURL: string;
  rating: number;
  provisionalRating: boolean;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  achievements: string[];
  xp: number;
  level: number;
  tier: string;
  created_at: Date;
  last_active: Date;
  preferred_topics: string[];
  debate_style: string;
  bio: string;
  preferences: UserPreferences;
  stats: UserStats;
  practiceSessions?: number;
  practiceTime?: number; // in minutes
  practiceAvgScore?: number;
  practiceRatingGain?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    debate_invites: boolean;
    achievements: boolean;
  };
  privacy: {
    profile_visible: boolean;
    show_rating: boolean;
    show_stats: boolean;
  };
}

export interface UserStats {
  totalArgumentsPosted: number;
  averageResponseTime: number;
  favoriteTopics: string[];
  strongestCategories: string[];
  practiceSessions?: number;
  practiceTime?: number;
  practiceAvgScore?: number;
  practiceRatingGain?: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  username: string;
  photoURL?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}