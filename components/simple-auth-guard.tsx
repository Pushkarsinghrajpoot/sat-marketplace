'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSimpleAuth } from '@/lib/simple-auth';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

export function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useSimpleAuth();

  const publicRoutes = ['/', '/about', '/help', '/categories', '/products', '/distributors', '/resellers', '/services', '/how-it-works', '/partner-program', '/privacy', '/terms', '/cookies', '/press', '/blog', '/careers', '/auth/login', '/auth/register', '/auth/login-supabase', '/auth/org-setup'];
  const isPublicRoute = publicRoutes.includes(pathname) ||
                        publicRoutes.some(route => pathname.startsWith(route + '/'));

  const authRoutes = ['/auth/login', '/auth/register', '/auth/login-supabase', '/auth/org-setup'];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (loading) return;

    // Logged-in user on an auth page → redirect to ?redirect param or role dashboard
    if (user && isAuthRoute) {
      const redirectTo = searchParams.get('redirect');
      if (redirectTo && redirectTo.startsWith('/')) {
        router.replace(redirectTo);
        return;
      }
      const dashboardPath =
        user.role === 'RESELLER' ? '/reseller/dashboard'
        : user.role === 'DISTRIBUTOR' ? '/distributor/dashboard'
        : user.role === 'PLATFORM_ADMIN' ? '/admin/dashboard'
        : user.role === 'END_USER' ? '/end-user/dashboard'
        : '/';
      router.replace(dashboardPath);
      return;
    }

    // Unauthenticated user on a protected route → send to login with redirect param
    if (!user && !isPublicRoute) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }
  }, [pathname, router, user, loading, isAuthRoute, isPublicRoute, searchParams]);

  // Public routes: render immediately — no flash, no spinner
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes: show spinner only while auth state is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
