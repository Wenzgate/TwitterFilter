import { NextRequest, NextResponse } from 'next/server';
import { secureHeaders } from 'next-secure-headers';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  secureHeaders({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https://pbs.twimg.com', 'https://*.twimg.com', 'data:'],
        connectSrc: ["'self'", 'https://api.twitter.com'],
        frameAncestors: ["'none'"]
      }
    }
  })(request, response);
  return response;
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
};
