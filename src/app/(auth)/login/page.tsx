import { signInWithPasswordAction } from "@/features/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <section className="mx-auto mt-20 max-w-md rounded-lg border border-slate-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
      <p className="mt-2 text-sm text-slate-600">Use your workforce account credentials.</p>

      <form action={signInWithPasswordAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-1"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Continue
        </button>
      </form>

      {params.error ? <p className="mt-3 text-sm text-rose-700">{params.error}</p> : null}
    </section>
  );
}
