"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("Admin123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }
    router.push(params.get("callbackUrl") || "/app");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="hero-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <div>
          <Link href="/" className="font-display text-2xl font-bold">
            ALara<span className="text-amber-300">SMIS</span>
          </Link>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Academic Excellence Through Digital Intelligence
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Secure access for administrators, principals, deputies, and teachers
            at ALara Primary & Junior Secondary School, Suna East, Migori.
          </p>
        </div>
        <p className="text-sm text-blue-200/80">CBC · KNEC · KICD aligned</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-display text-2xl font-bold text-primary">
              ALara<span className="text-primary-light">SMIS</span>
            </Link>
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Sign in
          </h2>
          <p className="mt-2 text-slate-500">
            Enter your credentials to access the school system.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <span className="cursor-not-allowed text-slate-400" title="Coming soon">
                Forgot password?
              </span>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="mb-2 font-semibold text-slate-800">Demo accounts (password: Admin123)</p>
            <ul className="space-y-1">
              <li>Admin — System Administrator</li>
              <li>principal — Principal</li>
              <li>deputy — Deputy Headteacher</li>
              <li>aouma — Class Teacher</li>
              <li>jochieng / smwangi — Subject Teachers</li>
            </ul>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="text-primary hover:underline">
              ← Back to school website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
