import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AuthContextType } from '../../types/auth';
import { cleanupOldQueueEntries } from '../../services/debate/matchmaking';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    loading,
    error,
    isAuthenticated,
    signInWithGoogle,
    signOut,
    updateProfile,
    clearError,
    initializeAuth,
    refreshUserData,
  } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state
    initializeAuth();
    
    // Clean up old queue entries on app start
    cleanupOldQueueEntries().catch(error => {
      console.warn('Failed to cleanup old queue entries:', error);
    });
  }, []); // Remove initializeAuth from dependencies to prevent infinite loop

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    signInWithGoogle,
    signInWithEmail: async () => {
      throw new Error('Email/password authentication is not supported. Please use Google Sign-In.');
    },
    signUp: async () => {
      throw new Error('Email/password registration is not supported. Please use Google Sign-In.');
    },
    signOut,
    resetPassword: async () => {
      throw new Error('Password reset is not supported. Please use Google Sign-In.');
    },
    updateProfile,
    clearError,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
