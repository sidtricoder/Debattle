import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithGoogle, signOutUser, onAuthStateChange, firestore } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

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
    theme: 'auto' as 'auto',
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

// Fetch the latest user data from Firestore and update the store
export const fetchUserFromFirestore = async (uid: string, set: any) => {
  const userDoc = await getDoc(doc(firestore, 'users', uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    // Convert Firestore Timestamps to JS Dates
    const user = {
      ...data,
      created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at,
      last_active: data.last_active?.toDate ? data.last_active.toDate() : data.last_active,
    };
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
          const result = await signInWithGoogle();
          const firebaseUser = result.user;
          // Check if user exists in Firestore
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          let userProfile: User;
          if (userDocSnap.exists()) {
            // User exists, use Firestore data
            const data = userDocSnap.data();
            userProfile = {
              uid: data.uid,
              email: data.email,
              displayName: data.displayName,
              username: data.username,
              photoURL: data.photoURL,
              rating: data.rating,
              provisionalRating: data.provisionalRating,
              gamesPlayed: data.gamesPlayed,
              wins: data.wins,
              losses: data.losses,
              draws: data.draws,
              winStreak: data.winStreak,
              bestWinStreak: data.bestWinStreak,
              win_rate: data.win_rate,
              achievements: data.achievements,
              xp: data.xp,
              level: data.level,
              tier: data.tier,
              created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at,
              last_active: new Date(),
              preferred_topics: data.preferred_topics,
              debate_style: data.debate_style,
              bio: data.bio,
              preferences: data.preferences,
              stats: data.stats
            };
            // Update last_active
            await setDoc(userDocRef, { last_active: Timestamp.fromDate(new Date()) }, { merge: true });
          } else {
            // New user, create Firestore document
            userProfile = {
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
                theme: 'auto' as 'auto',
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
            await setDoc(userDocRef, {
              ...userProfile,
              created_at: Timestamp.fromDate(userProfile.created_at),
              last_active: Timestamp.fromDate(userProfile.last_active)
            });
          }
          set({ 
            user: userProfile, 
            loading: false, 
            isAuthenticated: true,
            error: null 
          });
          localStorage.setItem('debattle_user', JSON.stringify(userProfile));
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
              theme: 'auto' as 'auto',
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
          let userRecord;
          let userProfile: User;
          console.log('VITE_USE_FIREBASE_AUTH:', import.meta.env.VITE_USE_FIREBASE_AUTH);
          if (import.meta.env.VITE_USE_FIREBASE_AUTH) {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            userRecord = userCredential.user;
            userProfile = {
              uid: userRecord.uid,
              email: userRecord.email || credentials.email, // ensure string
              displayName: credentials.displayName,
              username: credentials.username,
              photoURL: userRecord.photoURL || credentials.photoURL || '',
              rating: 1200,
              provisionalRating: false,
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
              preferred_topics: ['politics', 'technology', 'environment'],
              debate_style: 'analytical',
              bio: 'Passionate debater with a focus on evidence-based arguments.',
              preferences: {
                theme: 'auto' as 'auto',
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
                favoriteTopics: ['technology', 'politics'],
                strongestCategories: ['technology', 'science']
              }
            };
            // Wait for auth state to be ready
            await new Promise(resolve => {
              const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user && user.uid === userProfile.uid) {
                  unsubscribe();
                  resolve(true);
                }
              });
            });
          } else {
            // Fallback to mock user for dev/test
            userProfile = {
              uid: `user_${Date.now()}`,
              email: credentials.email,
              displayName: credentials.displayName,
              username: credentials.username,
              photoURL: credentials.photoURL || '',
              rating: 1200,
              provisionalRating: false,
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
              preferred_topics: ['politics', 'technology', 'environment'],
              debate_style: 'analytical',
              bio: 'Passionate debater with a focus on evidence-based arguments.',
              preferences: {
                theme: 'auto' as 'auto',
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
                favoriteTopics: ['technology', 'politics'],
                strongestCategories: ['technology', 'science']
              }
            };
          }
          console.log('userProfile.uid:', userProfile.uid);
          set({ 
            user: userProfile, 
            loading: false, 
            isAuthenticated: true,
            error: null 
          });
          localStorage.setItem('debattle_user', JSON.stringify(userProfile));
          try {
            await setDoc(doc(firestore, 'users', userProfile.uid), {
              ...userProfile,
              created_at: Timestamp.fromDate(userProfile.created_at),
              last_active: Timestamp.fromDate(userProfile.last_active)
            });
            console.log('User profile created in Firestore successfully');
          } catch (firestoreError: any) {
            console.error('Failed to create user profile in Firestore:', firestoreError);
          }
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
          
          // Merge updates
          const updatedUser: User = {
            ...currentUser,
            ...data,
            // Merge nested objects if present
            preferences: {
              ...currentUser.preferences,
              ...(data.preferences || {})
            },
            stats: {
              ...currentUser.stats,
              ...(data.stats || {})
            },
            achievements: data.achievements || currentUser.achievements,
            created_at: currentUser.created_at,
            last_active: new Date(),
          };
          
          // Write to Firestore
          await setDoc(doc(firestore, 'users', updatedUser.uid), {
            ...updatedUser,
            created_at: Timestamp.fromDate(
              updatedUser.created_at instanceof Date ? updatedUser.created_at : new Date(updatedUser.created_at)
            ),
            last_active: Timestamp.fromDate(new Date()),
          }, { merge: true });
          
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