import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAuth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

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
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};


