'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { getUserWithOrganization } from '@/lib/auth-helpers';

function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, login, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for initial load
    
    // Check for existing Supabase session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Restore user data from session if context is empty
        if (!user) {
          const { user: userData, organization } = await getUserWithOrganization(session.user.id);
          if (userData) {
            login(userData, organization);
          }
        }
      } else {
        // No Supabase session - check if user exists in Context from localStorage
        // Only redirect to login if BOTH Supabase session AND context user are missing
        const publicPaths = ['/auth/login', '/auth/signup', '/'];
        const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/auth/');
        
        if (!user && !isPublicPath) {
          // No session and no user in context - redirect to login
          console.log('No auth state found, redirecting to login');
          router.push('/auth/login');
        } else if (user && !isPublicPath) {
          // User exists in context but no Supabase session
          // This is okay - user was loaded from localStorage
          console.log('User loaded from localStorage, Supabase session will be restored on next API call');
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN' && session?.user) {
        const { user: userData, organization } = await getUserWithOrganization(session.user.id);
        if (userData) {
          login(userData, organization);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, user, login, loading]);

  return <>{children}</>;
}

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthChecker>{children}</AuthChecker>
    </AuthProvider>
  );
}
