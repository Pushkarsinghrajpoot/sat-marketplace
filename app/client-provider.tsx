'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { getUserWithOrganization } from '@/lib/auth-helpers';

function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, login, loading: contextLoading } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Don't do anything while context is still loading
    if (contextLoading) {
      console.log('🔄 AuthChecker: Context still loading...');
      return;
    }

    // Redirect authenticated users away from auth pages
    const authPages = ['/auth/login', '/auth/signup', '/auth/register'];
    const trulyPublicPaths = ['/', '/about', '/help'];
    const isAuthPage = authPages.includes(pathname);
    const isTrulyPublicPath = trulyPublicPaths.includes(pathname);
    
    // If user is authenticated and on an auth page, redirect to dashboard
    if (user && isAuthPage && !sessionChecked) {
      console.log('✅ User authenticated on auth page, redirecting to dashboard');
      setSessionChecked(true);
      const dashboardPath = user.role === 'RESELLER' ? '/reseller/dashboard' 
        : user.role === 'DISTRIBUTOR' ? '/distributor/dashboard'
        : user.role === 'PLATFORM_ADMIN' ? '/admin/dashboard'
        : '/';
      router.push(dashboardPath);
      return;
    }
    
    // Skip auth check for truly public paths
    if (isTrulyPublicPath) {
      console.log('✅ AuthChecker: Public path, skipping check');
      setSessionChecked(true);
      return;
    }

    // Only check session once
    if (sessionChecked) {
      console.log('✅ AuthChecker: Session already checked');
      return;
    }
    
    console.log('🔍 AuthChecker: Starting auth check. User in context:', user?.email || 'none');
    
    const initializeAuth = async () => {
      try {
        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthChecker: Error getting session:', error);
        }
        
        console.log('🔍 Supabase session:', session ? `Found (${session.user.email})` : 'Not found');
        console.log('🔍 Context user:', user ? `Found (${user.email})` : 'Not found');
        
        // Case 1: Have both session and context user - all good
        if (session?.user && user) {
          console.log('✅ Auth complete: Both session and context present');
          setSessionChecked(true);
          return;
        }
        
        // Case 2: Have session but no context user - restore to context
        if (session?.user && !user) {
          console.log('🔄 Restoring user from Supabase session to context...');
          const { user: userData, organization } = await getUserWithOrganization(session.user.id);
          if (userData) {
            login(userData, organization);
            console.log('✅ User restored to context');
            setSessionChecked(true);
            return;
          }
        }
        
        // Case 3: Have context user but no session - user loaded from localStorage, stay logged in
        if (!session?.user && user) {
          console.log('✅ User in context (from localStorage), keeping logged in');
          setSessionChecked(true);
          return;
        }
        
        // Case 4: No session AND no context user - redirect to login
        if (!session?.user && !user) {
          console.log('❌ No auth found anywhere, redirecting to login');
          setSessionChecked(true);
          router.push('/auth/login');
          return;
        }
      } catch (error) {
        console.error('❌ AuthChecker: Error in initializeAuth:', error);
        setSessionChecked(true);
      }
    };

    initializeAuth();

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
  }, [pathname, router, user, login, contextLoading, sessionChecked]);

  return <>{children}</>;
}

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthChecker>{children}</AuthChecker>
    </AuthProvider>
  );
}
