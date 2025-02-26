import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("a_session_")
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup")

  if (!authCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (authCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/documents/:path*",
    "/links/:path*",
    "/calendar/:path*",
    "/tags/:path*",
    "/groups/:path*",
    "/login",
    "/signup",
  ],
}

