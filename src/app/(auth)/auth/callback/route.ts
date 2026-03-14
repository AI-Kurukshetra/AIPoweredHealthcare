import { NextResponse } from "next/server";

import { provisionUserAccess } from "@/lib/auth/provision";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = url.searchParams.get("next");
  const redirectTo = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id && user.email) {
      await provisionUserAccess(user.id, user.email, user.user_metadata?.full_name);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
