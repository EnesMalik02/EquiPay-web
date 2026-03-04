import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/home', '/groups', '/profile']
const authRoutes = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  const isAuthenticated = !!(accessToken || refreshToken)

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
