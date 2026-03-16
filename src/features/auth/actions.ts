"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { env, isMfaEnforced } from "@/config/env";
import { provisionUserAccess } from "@/lib/auth/provision";
import { withTimeout } from "@/lib/fetch-with-timeout";
import { createClient } from "@/lib/supabase/server";
import type { HealthcareRole } from "@/types/app.types";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2).max(80),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(["super_admin", "org_admin", "care_coordinator", "field_nurse", "billing_staff", "patient"]).optional(),
    next: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormState = {
  formError?: string;
  fieldErrors?: Partial<Record<"email" | "password", string[]>>;
  values?: {
    email?: string;
    next?: string;
  };
};

export type SignupFormState = {
  formError?: string;
  formInfo?: string;
  fieldErrors?: Partial<
    Record<"fullName" | "email" | "password" | "confirmPassword" | "role", string[]>
  >;
  values?: {
    fullName?: string;
    email?: string;
    role?: string;
    next?: string;
  };
};

function authRedirectTarget(next?: string) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }
  return next;
}

export async function signInWithPasswordAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        email: String(formData.get("email") ?? ""),
        next: String(formData.get("next") ?? ""),
      },
    };
  }

  const { email, password, next } = parsed.data;

  try {
    const result = await withTimeout(
      (async () => {
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: "Invalid email or password." } as const;
        const target = authRedirectTarget(next);
        revalidatePath("/", "layout");
        if (!isMfaEnforced) return { ok: true, redirect: target } as const;
        const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceData?.currentLevel === "aal2") return { ok: true, redirect: target } as const;
        return { ok: true, redirect: `/mfa?next=${encodeURIComponent(target)}` } as const;
      })(),
      30_000,
      "Sign-in timed out. Check your Supabase project status (it may be paused) and .env."
    );

    if (!result.ok) {
      return {
        formError: result.error,
        values: { email, next: next ?? "" },
      };
    }
    redirect(result.redirect);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : "Sign-in failed.";
    return {
      formError: msg.includes("timed out") ? msg : "Unable to sign in. Please try again.",
      values: { email, next: next ?? "" },
    };
  }
}

export async function signInWithGoogleAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const nextValue = String(formData.get("next") ?? "");
  const target = authRedirectTarget(nextValue);
  const supabase = await createClient();

  const callbackUrl = new URL("/auth/callback", env.NEXT_PUBLIC_APP_URL);
  callbackUrl.searchParams.set("next", target);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return {
      formError: "Google sign-in is unavailable right now.",
      values: {
        next: nextValue,
      },
    };
  }

  redirect(data.url);
}

export async function signUpWithPasswordAction(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? ""),
        next: String(formData.get("next") ?? ""),
      },
    };
  }

  const { email, password, fullName, role, next } = parsed.data;
  const target = authRedirectTarget(next);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        // Persist the requested app role on the auth user so that
        // any late provisioning (e.g. first login) can honor it.
        role: role,
      },
    },
  });

  if (error) {
    const isEmailConflict = error.message.toLowerCase().includes("already");
    const detailedMessage = isEmailConflict
      ? undefined
      : `Unable to create account: ${error.message}`;

    return {
      formError: detailedMessage ?? "Unable to create account right now.",
      fieldErrors: isEmailConflict
        ? { email: ["An account with this email already exists."] }
        : undefined,
      values: {
        fullName,
        email,
        role,
        next: next ?? "",
      },
    };
  }

  if (data.user) {
    await provisionUserAccess(
      data.user.id,
      email,
      fullName,
      (role as HealthcareRole | undefined) ?? undefined
    );
  }

  if (!data.session) {
    return {
      formInfo: "Account created. Check your email to verify your account, then sign in.",
      values: {
        fullName,
        email,
        role,
        next: next ?? "",
      },
    };
  }

  revalidatePath("/", "layout");
  if (!isMfaEnforced) {
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
