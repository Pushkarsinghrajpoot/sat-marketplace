'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSimpleAuth } from '@/lib/simple-auth';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

export function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSimpleAuth();

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/about', '/help', '/categories', '/products', '/distributors', '/auth/login', '/auth/register', '/auth/login-supabase', '/auth/org-setup'];
    const isPublicRoute = publicRoutes.includes(pathname) || 
                          publicRoutes.some(route => pathname.startsWith(route + '/'));

    // Auth routes
    const authRoutes = ['/auth/login', '/auth/register', '/auth/login-supabase', '/auth/org-setup'];
    const isAuthRoute = authRoutes.includes(pathname);

    // If user is logged in and on auth page, redirect to dashboard
    if (user && isAuthRoute) {
      const dashboardPath = user.role === 'RESELLER' ? '/reseller/dashboard' 
        : user.role === 'DISTRIBUTOR' ? '/distributor/dashboard'
        : user.role === 'PLATFORM_ADMIN' ? '/admin/dashboard'
        : user.role === 'END_USER' ? '/end-user/dashboard'
        : '/';
      router.push(dashboardPath);
      return;
    }

    // If user is not logged in and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
      router.push('/auth/login');
      return;
    }

    // Otherwise, allow access
  }, [pathname, router, user, loading]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
