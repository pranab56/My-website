import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/verify' || path === '/forgot' || path === '/reset-password';

  const token = request.cookies.get('token')?.value || '';

  if (isPublicPath && token) {
    try {
      // If user is already logged in, redirect away from auth pages
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/overview', request.url));
    } catch (e) {
      // Invalid token, allow access to public path
    }
  }

  if (!isPublicPath && !token && !path.startsWith('/api')) {
    // Redirect to login if trying to access protected page without token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/overview/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/trades/:path*',
    '/login',
    '/signup',
    '/verify',
    '/forgot',
    '/reset-password',
  ],
};
