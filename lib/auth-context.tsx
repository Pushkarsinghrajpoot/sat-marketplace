'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Organization } from './types';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  login: (user: User, organization?: Organization | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedAuth = localStorage.getItem('auth-storage');
    if (storedAuth) {
      try {
        const { state } = JSON.parse(storedAuth);
        if (state?.user) {
          setUser(state.user);
          setOrganization(state.organization || null);
          console.log('AuthContext: Loaded user from storage:', state.user);
        }
      } catch (error) {
        console.error('AuthContext: Error parsing stored auth:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = (newUser: User, newOrganization?: Organization | null) => {
    console.log('AuthContext: Logging in user:', newUser);
    setUser(newUser);
    setOrganization(newOrganization || null);
    
    // Save to localStorage
    const authData = {
      state: {
        user: newUser,
        organization: newOrganization || null,
      },
      version: 0,
    };
    localStorage.setItem('auth-storage', JSON.stringify(authData));
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('auth-storage');
  };

  const value = {
    user,
    organization,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
