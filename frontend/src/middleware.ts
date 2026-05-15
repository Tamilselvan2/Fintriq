import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/transactions'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Basic substring matches for simplicity
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));
  const isAuthPath = authPaths.some(p => path.startsWith(p));

  // The refresh token is an HttpOnly cookie. We check for its existence.
  const hasRefreshToken = request.cookies.has('refreshToken');

  if (isProtectedPath && !hasRefreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && hasRefreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect root to dashboard if logged in, else login
  if (path === '/') {
    if (hasRefreshToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/transactions/:path*', '/login', '/register', '/'],
};
