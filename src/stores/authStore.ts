import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithGoogle, signOutUser, onAuthStateChange, firestore } from '../lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { User, AuthState } from '../types/auth';

interface AuthStore extends AuthState {
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => void;
}

// Helper function to convert Firestore data to User type
const toUser = (data: any): User => ({
  uid: data.uid || '',
  email: data.email || '',
  displayName: data.displayName || 'Anonymous User',
  username: data.username || 'anonymous',
  photoURL: data.photoURL || '',
  rating: data.rating || 1200,
  provisionalRating: data.provisionalRating !== undefined ? data.provisionalRating : true,
  gamesPlayed: data.gamesPlayed || 0,
  wins: data.wins || 0,
  losses: data.losses || 0,
  draws: data.draws || 0,
  winStreak: data.winStreak || 0,
  bestWinStreak: data.bestWinStreak || 0,
  win_rate: data.win_rate || 0,
  achievements: Array.isArray(data.achievements) ? data.achievements : [],
  xp: data.xp || 0,
  level: data.level || 1,
  tier: data.tier || 'bronze',
  created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at || new Date(),
  last_active: data.last_active?.toDate ? data.last_active.toDate() : data.last_active || new Date(),
  preferred_topics: Array.isArray(data.preferred_topics) ? data.preferred_topics : ['technology', 'politics'],
  debate_style: data.debate_style || 'analytical',
  bio: data.bio || 'New debater on the platform!',
  preferences: {
    theme: data.preferences?.theme || 'light',
    notifications: {
      email: data.preferences?.notifications?.email !== undefined ? data.preferences.notifications.email : true,
      push: data.preferences?.notifications?.push !== undefined ? data.preferences.notifications.push : true,
      debate_invites: data.preferences?.notifications?.debate_invites !== undefined ? data.preferences.notifications.debate_invites : true,
      achievements: data.preferences?.notifications?.achievements !== undefined ? data.preferences.notifications.achievements : true
    },
    privacy: {
      profile_visible: data.preferences?.privacy?.profile_visible !== undefined ? data.preferences.privacy.profile_visible : true,
      show_rating: data.preferences?.privacy?.show_rating !== undefined ? data.preferences.privacy.show_rating : true,
      show_stats: data.preferences?.privacy?.show_stats !== undefined ? data.preferences.privacy.show_stats : true
    }
  },
  stats: {
    totalArgumentsPosted: data.stats?.totalArgumentsPosted || 0,
    averageResponseTime: data.stats?.averageResponseTime || 0,
    favoriteTopics: Array.isArray(data.stats?.favoriteTopics) ? data.stats.favoriteTopics : [],
    strongestCategories: Array.isArray(data.stats?.strongestCategories) ? data.stats.strongestCategories : []
  }
});

// Fetch the latest user data from Firestore and update the store
const fetchUserFromFirestore = async (uid: string, set: any) => {
  const userDoc = await getDoc(doc(firestore, 'users', uid));
  if (userDoc.exists()) {
    const user = toUser(userDoc.data());
    set({ user, isAuthenticated: true, loading: false });
    localStorage.setItem('debattle_user', JSON.stringify(user));
    return user;
  }
  return null;
};

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
          const { user } = await signInWithGoogle();
          
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          
          if (!userDoc.exists()) {
            // Create new user in Firestore
            const newUser: User = toUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              username: user.displayName?.toLowerCase().replace(/\s+/g, '_') || 'anonymous',
              photoURL: user.photoURL
            });

            // Convert Date objects to Firestore Timestamp for storage
            await setDoc(doc(firestore, 'users', user.uid), {
              ...newUser,
              created_at: Timestamp.fromDate(newUser.created_at),
              last_active: Timestamp.fromDate(newUser.last_active)
            });
            
            set({ 
              user: newUser,
              isAuthenticated: true, 
              loading: false 
            });
          } else {
            // Update last active timestamp
            await setDoc(
              doc(firestore, 'users', user.uid),
              { last_active: Timestamp.now() },
              { merge: true }
            );
            
            // Get the latest user data
            const userData = toUser(userDoc.data());
            
            set({ 
              user: userData,
              isAuthenticated: true, 
              loading: false 
            });
          }
        } catch (error: any) {
          console.error('Google sign in error:', error);
          set({ 
            error: error.message || 'Failed to sign in with Google', 
            loading: false 
          });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          await signOutUser();
          set({ user: null, isAuthenticated: false, loading: false });
          localStorage.removeItem('debattle_user');
        } catch (error: any) {
          console.error('Sign out error:', error);
          set({ error: error.message || 'Failed to sign out', loading: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        try {
          set({ loading: true });
          
          // Update in Firestore
          await setDoc(
            doc(firestore, 'users', user.uid),
            { 
              ...data, 
              updated_at: Timestamp.now() 
            },
            { merge: true }
          );
          
          // Update local state
          set({
            user: { ...user, ...data },
            loading: false
          });
        } catch (error: any) {
          console.error('Update profile error:', error);
          set({ error: error.message || 'Failed to update profile', loading: false });
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      initializeAuth: () => {
        set({ loading: true });
        
        // Check for cached user first
        const cachedUser = localStorage.getItem('debattle_user');
        if (cachedUser) {
          try {
            const user = JSON.parse(cachedUser);
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
        const unsubscribe = onAuthStateChange((firebaseUser) => {
          try {
            if (firebaseUser) {
              // User is signed in
              fetchUserFromFirestore(firebaseUser.uid, set);
            } else {
              // User is signed out
              set({ 
                user: null, 
                loading: false, 
                isAuthenticated: false 
              });
              localStorage.removeItem('debattle_user');
            }
          } catch (error) {
            console.error('Auth state error:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Authentication error', 
              loading: false 
            });
          }
        });

        // Cleanup function
        return () => {
          if (unsubscribe) unsubscribe();
        };
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