// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const isLoggedIn = !!token

    // اگر کاربر لاگین نکرده و به صفحه لاگین نمی‌رود
    if (!isLoggedIn && path !== "/login") {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(url)
    }

    // اگر لاگین کرده و به لاگین رفت، ببرش به dashboard
    if (isLoggedIn && path === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // مدیریت دسترسی بر اساس نقش (RBAC)
    const role = token?.role as string

    // فقط ADMIN به /admin دسترسی دارد
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // ENGINEER و ADMIN به /engineering دسترسی دارند
    if (path.startsWith("/engineering")) {
      if (!["ADMIN", "ENGINEER"].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // EMPLOYEE و ADMIN و ENGINEER به /employee دسترسی دارند
    if (path.startsWith("/employee")) {
      if (!["ADMIN", "ENGINEER", "EMPLOYEE"].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // CUSTOMER فقط به /customer و /dashboard دسترسی دارد
    if (path.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // این تابع فقط برای روت‌هایی که در matcher هستند اجرا می‌شود
        return true
      }
    }
  }
)

// مسیرهایی که middleware روی آنها اجرا شود
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/engineering/:path*",
    "/employee/:path*",
    "/customer/:path*",
    "/login",
  ]
}