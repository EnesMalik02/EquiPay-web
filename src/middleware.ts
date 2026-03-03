import { NextRequest, NextResponse } from 'next/server'

// (main) altındaki korumalı rotalar
const protectedRoutes = ['/home']

// (auth) altındaki auth rotaları
const authRoutes = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  const isAuthenticated = !!(accessToken || refreshToken)

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Oturum yok → korumalı rotaya erişim engelle
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Oturum var → auth rotalarına erişim engelle
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aşağıdakileri hariç tüm request path'lerini eşleştir:
     * - _next/static (static dosyalar)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public klasörü
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
