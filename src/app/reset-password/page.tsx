"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Missing reset token");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setMessage("Password successfully reset! You can now log in.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold">Invalid Link</h2>
        <p className="mt-2 text-slate-400">The reset link is missing or invalid.</p>
        <div className="mt-6">
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Create New Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your new password below.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {message && (
          <div className="rounded-md bg-green-500/10 p-4 border border-green-500/20">
            <p className="text-sm font-medium text-green-400">{message}</p>
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="relative block w-full rounded-md border-0 bg-slate-900/50 py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="relative block w-full rounded-md border-0 bg-slate-900/50 py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || !!message}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
