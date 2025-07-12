import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AuthContextType } from '../../types/auth';

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
    signInWithEmail,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state
    initializeAuth();
  }, [initializeAuth]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
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
