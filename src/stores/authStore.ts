import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithGoogle, signOutUser, onAuthStateChange } from '../lib/firebase';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthStore extends AuthState {
  // Actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Initialize auth state listener
  initializeAuth: () => void;
}

// Mock user data for development (when Firebase is not available)
const createMockUser = (firebaseUser: any): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || 'Anonymous User',
  username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '_') || 'anonymous',
  photoURL: firebaseUser.photoURL || '',
  rating: 1200,
  provisionalRating: true,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  bestWinStreak: 0,
  win_rate: 0,
  achievements: [],
  xp: 0,
  level: 1,
  tier: 'bronze',
  created_at: new Date(),
  last_active: new Date(),
  preferred_topics: ['technology', 'politics'],
  debate_style: 'analytical',
  bio: 'New debater on the platform!',
  preferences: {
    theme: 'auto',
    notifications: {
      email: true,
      push: true,
      debate_invites: true,
      achievements: true
    },
    privacy: {
      profile_visible: true,
      show_rating: true,
      show_stats: true
    }
  },
  stats: {
    totalArgumentsPosted: 0,
    averageResponseTime: 0,
    favoriteTopics: [],
    strongestCategories: []
  }
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      // Actions
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          const result = await signInWithGoogle();
          const mockUser = createMockUser(result.user);
          set({ 
            user: mockUser, 
            loading: false, 
            isAuthenticated: true,
            error: null 
          });
          
          // Save to localStorage for persistence
          localStorage.setItem('debattle_user', JSON.stringify(mockUser));
        } catch (error: any) {
          console.error('Google sign-in error:', error);
          set({ 
            loading: false, 
            error: error.message || 'Failed to sign in with Google',
            isAuthenticated: false 
          });
        }
      },

      signInWithEmail: async (credentials: LoginCredentials) => {
        try {
          set({ loading: true, error: null });
          
          // Mock email authentication for now
          const mockUser: User = {
            uid: `email_${Date.now()}`,
            email: credentials.email,
            displayName: credentials.email.split('@')[0],
            username: credentials.email.split('@')[0],
            photoURL: '',
            rating: 1200,
            provisionalRating: true,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winStreak: 0,
            bestWinStreak: 0,
            win_rate: 0,
            achievements: [],
            xp: 0,
            level: 1,
            tier: 'bronze',
            created_at: new Date(),
            last_active: new Date(),
            preferred_topics: ['technology', 'politics'],
            debate_style: 'analytical',
            bio: 'New debater on the platform!',
            preferences: {
              theme: 'auto',
              notifications: {
                email: true,
                push: true,
                debate_invites: true,
                achievements: true
              },
              privacy: {
                profile_visible: true,
                show_rating: true,
                show_stats: true
              }
            },
            stats: {
              totalArgumentsPosted: 0,
              averageResponseTime: 0,
              favoriteTopics: [],
              strongestCategories: []
            }
          };
          
          set({ 
            user: mockUser, 
            loading: false, 
            isAuthenticated: true,
            error: null 
          });
          
          localStorage.setItem('debattle_user', JSON.stringify(mockUser));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to sign in',
            isAuthenticated: false 
          });
        }
      },

      signUp: async (credentials: RegisterCredentials) => {
        try {
          set({ loading: true, error: null });
          
          // Mock registration
          const mockUser: User = {
            uid: `user_${Date.now()}`,
            email: credentials.email,
            displayName: credentials.displayName,
            username: credentials.username,
            photoURL: '',
            rating: 1200,
    provisionalRating: true,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    bestWinStreak: 0,
            win_rate: 0,
    achievements: [],
    xp: 0,
    level: 1,
            tier: 'bronze',
            created_at: new Date(),
            last_active: new Date(),
            preferred_topics: ['technology', 'politics'],
            debate_style: 'analytical',
            bio: 'New debater on the platform!',
            preferences: {
              theme: 'auto',
              notifications: {
                email: true,
                push: true,
                debate_invites: true,
                achievements: true
              },
              privacy: {
                profile_visible: true,
                show_rating: true,
                show_stats: true
              }
            },
            stats: {
              totalArgumentsPosted: 0,
              averageResponseTime: 0,
              favoriteTopics: [],
              strongestCategories: []
            }
          };
          
          set({ 
            user: mockUser, 
            loading: false, 
            isAuthenticated: true,
            error: null 
          });
          
          localStorage.setItem('debattle_user', JSON.stringify(mockUser));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to sign up',
            isAuthenticated: false 
          });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          await signOutUser();
          set({ 
            user: null, 
            loading: false, 
            isAuthenticated: false,
            error: null 
          });
          localStorage.removeItem('debattle_user');
        } catch (error: any) {
          console.error('Sign out error:', error);
          // Even if Firebase sign out fails, clear local state
          set({ 
    user: null,
            loading: false, 
    isAuthenticated: false,
            error: null 
          });
          localStorage.removeItem('debattle_user');
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          // Mock password reset
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ loading: false, error: null });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to reset password' 
          });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ loading: true, error: null });
          const currentUser = get().user;
          if (!currentUser) throw new Error('No user logged in');
          
          const updatedUser = { ...currentUser, ...data };
          set({ 
            user: updatedUser, 
            loading: false, 
            error: null 
          });
          
          localStorage.setItem('debattle_user', JSON.stringify(updatedUser));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to update profile' 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          loading: false 
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      initializeAuth: () => {
        set({ loading: true });
        
        // Try to restore user from localStorage first
        const savedUser = localStorage.getItem('debattle_user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            set({ 
              user, 
              loading: false, 
              isAuthenticated: true 
            });
          } catch (error) {
            localStorage.removeItem('debattle_user');
          }
        }

        // Set up Firebase auth state listener
        try {
          const unsubscribe = onAuthStateChange((firebaseUser) => {
            if (firebaseUser) {
              const mockUser = createMockUser(firebaseUser);
              set({ 
                user: mockUser, 
                loading: false, 
                isAuthenticated: true 
              });
              localStorage.setItem('debattle_user', JSON.stringify(mockUser));
            } else {
              set({ 
                user: null, 
                loading: false, 
                isAuthenticated: false 
              });
              localStorage.removeItem('debattle_user');
            }
          });

          // Cleanup function
          return unsubscribe;
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false });
        }
      }
    }),
    {
      name: 'debattle-auth',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);