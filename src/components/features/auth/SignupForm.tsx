"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";

import { signUpWithPasswordAction, type SignupFormState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  nextPath: string;
};

const initialState: SignupFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full bg-cyan-700 hover:bg-cyan-600"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Create account"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <>
      {errors.map((error) => (
        <p key={error} className="text-xs text-rose-700">
          {error}
        </p>
      ))}
    </>
  );
}

export function SignupForm({ nextPath }: SignupFormProps) {
  const [state, formAction] = useActionState(signUpWithPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          defaultValue={state.values?.fullName ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.fullName?.length)}
        />
        <FieldErrors errors={state.fieldErrors?.fullName} />
      </div>
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
        <FieldErrors errors={state.fieldErrors?.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password?.length)}
        />
        <FieldErrors errors={state.fieldErrors?.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword?.length)}
        />
        <FieldErrors errors={state.fieldErrors?.confirmPassword} />
      </div>

      <SubmitButton />

      {state.formError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.formError}
        </p>
      ) : null}
      {state.formInfo ? (
        <p className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
          {state.formInfo}
        </p>
      ) : null}
    </form>
  );
}
