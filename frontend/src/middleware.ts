import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPath = authPaths.some(p => path.startsWith(p));

  // Check for refresh token cookie (works when same domain; 
  // on cross-domain deployments, client-side auth context handles protection)
  const hasRefreshToken = request.cookies.has('refreshToken');

  // Only redirect logged-in users away from auth pages (login/register)
  if (isAuthPath && hasRefreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect root based on cookie presence
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
