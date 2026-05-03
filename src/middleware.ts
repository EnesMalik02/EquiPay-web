import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/home', '/groups', '/profile', '/settlements']
const AUTH_ROUTES = ['/', '/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // refresh_token aktif bir oturumun göstergesidir; access_token kısa ömürlü olup
  // client tarafında yenilenir, bu nedenle session kontrolü için refresh_token yeterlidir.
  const hasSession = !!request.cookies.get('refresh_token')?.value

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    route === '/' ? pathname === route : pathname.startsWith(route)
  )

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
