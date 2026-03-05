'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { getUserWithOrganization } from '@/lib/auth-helpers';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, login } = useAuthStore();

  useEffect(() => {
    // Check for existing Supabase session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Restore user data from session if Zustand store is empty
        if (!user) {
          const { user: userData, organization } = await getUserWithOrganization(session.user.id);
          if (userData) {
            login(userData, organization);
          }
        }
      } else {
        // No session - middleware will handle redirect
        // Just restore user data if we have a session but no user in store
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
  }, [pathname, router, user, login]);

  return <>{children}</>;
}
