"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const callbackUrl = `${window.location.origin}/app`;
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password. Please try again.");
      return;
    }
    const targetUrl = res?.url ?? params.get("callbackUrl") ?? callbackUrl;
    window.location.assign(targetUrl);
  }


  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hero-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <div>
          <Link href="/" className="font-display text-2xl font-bold">
            ALara<span className="text-amber-300">SMIS</span>
          </Link>
          <p className="mt-1 text-xs text-blue-200/70 uppercase tracking-widest">v5.0 · PP1–Grade 9 CBC</p>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Academic Excellence<br />Through Digital Intelligence
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Secure, role-based access for all ALara Primary &amp; Junior Secondary School stakeholders — Suna East, Migori County, Kenya.
          </p>
          {/* KNEC Scale preview */}
          <div className="mt-8 grid grid-cols-4 gap-2">
            {[
              { band: "EE1", label: "90–100", color: "bg-emerald-500" },
              { band: "EE2", label: "75–89", color: "bg-green-500" },
              { band: "ME1", label: "58–74", color: "bg-blue-500" },
              { band: "ME2", label: "41–57", color: "bg-sky-500" },
              { band: "AE1", label: "31–40", color: "bg-amber-500" },
              { band: "AE2", label: "21–30", color: "bg-orange-500" },
              { band: "BE1", label: "11–20", color: "bg-rose-500" },
              { band: "BE2", label: "0–10", color: "bg-red-700" },
            ].map((g) => (
              <div key={g.band} className="flex flex-col items-center rounded-lg bg-white/10 p-2 text-center backdrop-blur-sm">
                <span className={`rounded-full ${g.color} px-2 py-0.5 text-xs font-black text-white`}>{g.band}</span>
                <span className="mt-1 text-[10px] text-blue-100">{g.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-blue-300/70">KNEC 8-Point CBC Achievement Scale</p>
        </div>
        <p className="text-sm text-blue-200/60">CBC · KNEC · KICD aligned © {new Date().getFullYear()}</p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-display text-2xl font-bold text-primary">
              ALara<span className="text-primary-light">SMIS</span>
            </Link>
          </div>

          <h2 className="font-display text-3xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-slate-500">Enter your credentials to access the school portal.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="username">Username</label>
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
              <label className="label" htmlFor="password">Password</label>
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
              <Link href="/forgot-password" className="text-indigo-600 hover:underline" title="Reset your password">
                Forgot password?
              </Link>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in…" : "Login →"}
            </button>
          </form>



          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="text-primary hover:underline">
              ← Back to ALara school website
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
