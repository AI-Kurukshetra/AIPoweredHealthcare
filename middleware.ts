import { NextResponse, type NextRequest } from "next/server";

import { isMfaEnforced } from "@/config/env";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_REQUIRED_PREFIXES = [
  "/dashboard",
  "/analytics",
  "/patients",
  "/visits",
  "/schedule",
  "/staff",
  "/compliance",
  "/communications",
  "/billing",
  "/incidents",
];

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const nextPath = pathname + request.nextUrl.search;

  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/mfa");
  let currentLevel: "aal1" | "aal2" | null = null;

  if (isMfaEnforced && user) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    currentLevel = data?.currentLevel ?? null;
  }

  if (requiresAuth && !user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, request.url));
  }

  if (isMfaEnforced && requiresAuth && user && currentLevel !== "aal2") {
    return NextResponse.redirect(new URL(`/mfa?next=${encodeURIComponent(nextPath)}`, request.url));
  }

  if (isAuthPage && user) {
    if (pathname.startsWith("/mfa")) {
      if (!isMfaEnforced) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (currentLevel === "aal2") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return response;
    }

    if (pathname.startsWith("/login")) {
      if (!isMfaEnforced) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (currentLevel === "aal2") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/mfa", request.url));
    }

    if (pathname.startsWith("/signup")) {
      if (!isMfaEnforced) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (currentLevel === "aal2") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/mfa", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/analytics/:path*",
    "/patients/:path*",
    "/visits/:path*",
    "/schedule/:path*",
    "/staff/:path*",
    "/compliance/:path*",
    "/communications/:path*",
    "/billing/:path*",
    "/incidents/:path*",
    "/login",
    "/signup",
    "/mfa",
  ],
};
