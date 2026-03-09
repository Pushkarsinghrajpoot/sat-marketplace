'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User, Organization } from './types';

interface SimpleAuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user data from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            organizationId: userData.organization_id,
            role: userData.role,
            phoneNumber: userData.phone_number,
            isActive: userData.is_active,
            lastLoginAt: userData.last_login_at,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
          };

          setUser(mappedUser);

          // Get organization if user has one
          if (userData.organization_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', userData.organization_id)
              .single();

            if (orgData) {
              setOrganization(orgData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user data from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData) {
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            organizationId: userData.organization_id,
            role: userData.role,
            phoneNumber: userData.phone_number,
            isActive: userData.is_active,
            lastLoginAt: userData.last_login_at,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
          };

          setUser(mappedUser);

          // Get organization if user has one
          if (userData.organization_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', userData.organization_id)
              .single();

            if (orgData) {
              setOrganization(orgData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setOrganization(null);
    } catch (error) {
      console.error('Logout error:', error);
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

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}
