'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User, Organization } from './types';
import { getUserWithOrganization } from './auth-helpers';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from Supabase session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('AuthContext: Found Supabase session, loading user data');
          const { user: userData, organization: orgData } = await getUserWithOrganization(session.user.id);
          if (userData) {
            setUser(userData);
            setOrganization(orgData);
            console.log('AuthContext: User loaded successfully');
          }
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const { user: userData, organization: orgData } = await getUserWithOrganization(session.user.id);
        if (userData) {
          setUser(userData);
          setOrganization(orgData);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setOrganization(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { user: userData, organization: orgData } = await getUserWithOrganization(data.user.id);
        if (userData) {
          setUser(userData);
          setOrganization(orgData);
        }
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setOrganization(null);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
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
