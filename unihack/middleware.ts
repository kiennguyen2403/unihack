// middleware.ts
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { updateSession } from "@/utils/supabase/middleware";

// Define public routes (sign-in and sign-up)
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();

  // Redirect authenticated users from root (/) to /user
  if (userId && req.nextUrl.pathname === "/") {
    const homeUrl = new URL("/user", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect(); // Enforce authentication
  }

  // Run Supabase session update (assuming it needs auth context)
  return await updateSession(req);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
