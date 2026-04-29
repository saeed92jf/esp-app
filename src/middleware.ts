import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// مسیرهای عمومی (بدون نیاز به لاگین)
const publicPaths = ['/', '/login', '/register', '/about', '/contact', '/pricing']
const authPaths = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl
  
  const isPublicPath = publicPaths.some(path => pathname === path) || pathname.startsWith('/api')
  const isAuthPath = authPaths.some(path => pathname === path)
  
  // اگر توکن نداره و میخواد بره به صفحه خصوصی
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // اگر توکن داره و میخواد بره به صفحه لاگین/رجیستر
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|fonts|icons|images).*)',
  ],
}