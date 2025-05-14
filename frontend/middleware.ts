import { NextRequest, NextResponse } from 'next/server'

// Pages publiques (sans auth requise)
const PUBLIC_ROUTES = ['/login', '/signup', '/']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  const isPublic = PUBLIC_ROUTES.some((route) => req.nextUrl.pathname.startsWith(route))

  if (isPublic) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
