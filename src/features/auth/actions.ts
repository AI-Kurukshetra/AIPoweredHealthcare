"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { env, isMfaEnforced } from "@/config/env";
import { provisionUserAccess } from "@/lib/auth/provision";
import { createClient } from "@/lib/supabase/server";

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
    Record<"fullName" | "email" | "password" | "confirmPassword", string[]>
  >;
  values?: {
    fullName?: string;
    email?: string;
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

  const supabase = await createClient();
  const { email, password, next } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      formError: "Invalid email or password.",
      values: {
        email,
        next: next ?? "",
      },
    };
  }

  if (data.user) {
    await provisionUserAccess(data.user.id, data.user.email ?? email, data.user.user_metadata?.full_name);
  }

  const target = authRedirectTarget(next);

  revalidatePath("/", "layout");
  if (!isMfaEnforced) {
    redirect(target);
  }

  const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assuranceData?.currentLevel === "aal2") {
    redirect(target);
  }

  redirect(`/mfa?next=${encodeURIComponent(target)}`);
}

export async function signInWithGoogleAction(formData: FormData) {
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
    redirect(`/login?error=${encodeURIComponent("Google sign-in is unavailable right now.")}`);
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
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        next: String(formData.get("next") ?? ""),
      },
    };
  }

  const { email, password, fullName, next } = parsed.data;
  const target = authRedirectTarget(next);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    const isEmailConflict = error.message.toLowerCase().includes("already");
    return {
      formError: isEmailConflict ? undefined : "Unable to create account right now.",
      fieldErrors: isEmailConflict
        ? { email: ["An account with this email already exists."] }
        : undefined,
      values: {
        fullName,
        email,
        next: next ?? "",
      },
    };
  }

  if (data.user) {
    await provisionUserAccess(data.user.id, email, fullName);
  }

  if (!data.session) {
    return {
      formInfo: "Account created. Check your email to verify your account, then sign in.",
      values: {
        fullName,
        email,
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
