"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

function authRedirectTarget(next?: string) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }
  return next;
}

export async function signInWithPasswordAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    redirect("/login?error=Invalid%20credentials%20format");
  }

  const supabase = await createClient();
  const { email, password, next } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=Invalid%20email%20or%20password");
  }

  const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const target = authRedirectTarget(next);

  revalidatePath("/", "layout");
  if (assuranceData?.currentLevel === "aal2") {
    redirect(target);
  }

  redirect(`/mfa?next=${encodeURIComponent(target)}`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
