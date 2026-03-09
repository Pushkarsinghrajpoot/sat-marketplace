'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to be initialized
    if (loading) {
      console.log('🔄 AuthChecker: Auth still loading...');
      return;
    }

    const authPages = ['/auth/login', '/auth/signup', '/auth/register'];
    const publicPaths = ['/', '/about', '/help', '/categories', '/products', '/distributors'];
    const isAuthPage = authPages.includes(pathname);
    const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

    console.log('🔍 AuthChecker: Path:', pathname, 'User:', user?.email || 'none', 'Loading:', loading);

    // If user is authenticated and on auth page, redirect to dashboard
    if (user && isAuthPage) {
      console.log('✅ AuthChecker: User authenticated on auth page, redirecting to dashboard');
      const dashboardPath = user.role === 'RESELLER' ? '/reseller/dashboard' 
        : user.role === 'DISTRIBUTOR' ? '/distributor/dashboard'
        : user.role === 'PLATFORM_ADMIN' ? '/admin/dashboard'
        : '/';
      router.push(dashboardPath);
      return;
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!user && !isPublicPath && !isAuthPage) {
      console.log('❌ AuthChecker: No user on protected route, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Otherwise, allow access
    console.log('✅ AuthChecker: Access allowed');
  }, [pathname, router, user, loading]);

  return <>{children}</>;
}

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthChecker>{children}</AuthChecker>
    </AuthProvider>
  );
}
