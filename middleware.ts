import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/help',
    '/how-it-works',
    '/partner-program',
    '/press',
    '/privacy',
    '/terms',
    '/cookies',
    '/categories',
    '/products',
    '/distributors',
    '/services',
    '/blog',
    '/careers',
    '/api/products',
    '/api/categories',
    '/api/distributors',
    '/auth/login',
    '/auth/register',
    '/auth/login-supabase',
    '/auth/org-setup'
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes require authentication - but be less aggressive
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session }, error } = await supabase.auth.getSession();

    // Only redirect if there's a clear error or if accessing auth pages while logged in
    if (error) {
      console.log('Middleware: Session error, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If no session, let client-side handle it (don't redirect immediately)
    if (!session) {
      console.log('Middleware: No session found, allowing client-side auth check');
      return NextResponse.next();
    }

    // Role-based route protection
    const adminRoutes = ['/admin'];
    const distributorRoutes = ['/distributor'];
    const resellerRoutes = ['/reseller'];
    const endUserRoutes = ['/end-user'];

    // For now, let client-side handle role validation
    // This prevents middleware from being too aggressive
    console.log('Middleware: Session found, allowing client-side role check');
    return NextResponse.next();

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, redirect to login for safety
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
