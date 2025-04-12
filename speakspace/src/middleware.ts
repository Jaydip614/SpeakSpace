import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protect all dashboard routes
  '/complete-profile(.*)', // Protect complete profile route
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    const aj = arcjet({
      key: process.env.ARCJET_KEY!,
      characteristics: ["userId"],
      rules: [
        tokenBucket({
          mode: "LIVE",
          refillRate: 2,
          interval: 10,
          capacity: 30
        })
      ]
    });
    const decision = await aj.protect(req, {
      userId: userId ?? "unknown",
      requested: 1
    });
    if(decision.isDenied()) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};