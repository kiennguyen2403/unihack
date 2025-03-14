import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


const isProtectedRoute = createRouteMatcher(['/user(.*)'])
const isPublicRoute = createRouteMatcher(['/'])



export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (userId && req.nextUrl.pathname === '/') {
    const userUrl = new URL('/user', req.url)
    return NextResponse.redirect(userUrl)
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
