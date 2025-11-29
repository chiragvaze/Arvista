import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, admin routes will be protected by client-side auth checks
  // Full middleware auth will be added when using a compatible auth solution
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
