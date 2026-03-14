import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const AUTH_REQUIRED_PREFIXES = ["/dashboard", "/patients", "/visits", "/incidents"];

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const nextPath = pathname + request.nextUrl.search;

  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/mfa");
  let currentLevel: "aal1" | "aal2" | null = null;

  if (user) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    currentLevel = data?.currentLevel ?? null;
  }

  if (requiresAuth && !user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, request.url));
  }

  if (requiresAuth && user && currentLevel !== "aal2") {
    return NextResponse.redirect(new URL(`/mfa?next=${encodeURIComponent(nextPath)}`, request.url));
  }

  if (isAuthPage && user) {
    if (pathname.startsWith("/mfa")) {
      if (currentLevel === "aal2") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return response;
    }

    if (pathname.startsWith("/login")) {
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
    "/dashboard/:path*",
    "/patients/:path*",
    "/visits/:path*",
    "/incidents/:path*",
    "/login",
    "/mfa",
  ],
};
