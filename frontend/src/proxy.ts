import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Guard de rutas del backoffice (Next.js 16 renombró `middleware` → `proxy`).
 *
 * Comprobación optimista server-side: solo puede ver la cookie httpOnly
 * `refreshToken` (el access token vive en localStorage, inaccesible aquí). La
 * verificación real del access token la hace el cliente `api` en cada petición.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // La pantalla de login es pública.
  if (pathname.startsWith('/backoffice/login')) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.has('refreshToken')
  if (!hasSession) {
    return NextResponse.redirect(new URL('/backoffice/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/backoffice/:path*'],
}
