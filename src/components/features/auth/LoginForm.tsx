"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  signInWithGoogleAction,
  signInWithPasswordAction,
  type LoginFormState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

type LoginFormProps = {
  nextPath: string;
};

const initialState: LoginFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full bg-cyan-700 hover:bg-cyan-600"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Continue"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 3l3 2.3c1.8-1.6 2.8-4 2.8-6.8 0-.7-.1-1.4-.2-2H12z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 5-1 6.7-2.7l-3-2.3c-.8.6-2 .9-3.7.9-2.8 0-5.1-1.9-5.9-4.5l-3.1 2.4C4.7 19.5 8.1 22 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M6.1 13.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3 7.2C2.4 8.4 2 9.8 2 11.5s.4 3.1 1 4.3l3.1-2.4z"
        />
        <path
          fill="#4285F4"
          d="M12 5.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.3 14.7 1.5 12 1.5 8.1 1.5 4.7 4 3 7.2l3.1 2.4C6.9 7 9.2 5.1 12 5.1z"
        />
      </svg>
      {pending ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(signInWithPasswordAction, initialState);
  const [googleState, googleFormAction] = useActionState(signInWithGoogleAction, initialState);
  const activeError = state.formError ?? googleState.formError;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <form action={googleFormAction}>
        <input type="hidden" name="next" value={nextPath} />
        <GoogleButton />
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide text-slate-500">
          <span className="bg-white px-2">Or continue with email</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.values?.email ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.email?.length)}
          />
          {state.fieldErrors?.email?.map((error) => (
            <p key={error} className="text-xs text-rose-700">
              {error}
            </p>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              aria-invalid={Boolean(state.fieldErrors?.password?.length)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {state.fieldErrors?.password?.map((error) => (
            <p key={error} className="text-xs text-rose-700">
              {error}
            </p>
          ))}
        </div>
        <SubmitButton />

        {activeError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {activeError}
          </p>
        ) : null}
      </form>
    </div>
  );
}
