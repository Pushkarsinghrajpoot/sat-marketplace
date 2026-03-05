import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get the auth token from the request cookies
  const token = req.cookies.get('sb-access-token')?.value

  let session = null
  if (token) {
    try {
      // Verify the session with the token
      const { data } = await supabase.auth.getUser(token)
      session = data.user ? { user: data.user } : null
    } catch (error) {
      // Invalid token
      session = null
    }
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/how-it-works',
    '/privacy',
    '/cookies',
    '/distributors',
    '/products',
    '/categories',
    '/services'
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith(route + '/') ||
    req.nextUrl.pathname.startsWith('/auth/') ||
    req.nextUrl.pathname.startsWith('/(public)/')
  )

  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth pages, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth/')) {
    // Determine user role and redirect accordingly
    const { data: userOrg } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', session.user.id)
      .single()

    if (userOrg) {
      let dashboardUrl = '/'
      switch (userOrg.role) {
        case 'RESELLER':
          dashboardUrl = '/reseller/dashboard'
          break
        case 'DISTRIBUTOR':
          dashboardUrl = '/distributor/dashboard'
          break
        case 'ADMIN':
          dashboardUrl = '/admin/dashboard'
          break
        default:
          dashboardUrl = '/'
      }
      return NextResponse.redirect(new URL(dashboardUrl, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
