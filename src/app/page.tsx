import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#020817] font-sans text-slate-50 selection:bg-indigo-500/30 overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 h-80 w-80 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Glassmorphism Navbar */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-inner">
              <span className="text-white">A</span>
            </div>
            ALara<span className="font-light text-slate-400">SMIS</span>
          </Link>

          <Link
            href="/login"
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-white/20 hover:bg-white/20 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          System v5.0 is Live &bull; PP1–Grade 9 CBC Aligned
        </div>
        
        <h1 className="font-display max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          School Management, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Perfected.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          The ultimate digital infrastructure for ALara Primary &amp; Junior Secondary School. 
          Manage learners, academics, finances, and faculty in one secure, unified platform.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/25"
          >
            Access Secure Portal
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 border-t border-white/10 pt-12 text-left">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Enterprise Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Role-based access control, cryptographic hashing, and comprehensive audit logs ensure institutional data is strictly protected.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">CBC Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Fully aligned with the KNEC 8-point grading scale. Automatically compute performance bands and generate termly transcripts.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Financial Precision</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time ledger accounting for fee collections, dynamic balances, and transparent historical payment tracking.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80 py-8 text-center text-sm text-slate-500 backdrop-blur-xl">
        <p>
          &copy; {new Date().getFullYear()} ALara School Management Information System. Migori County, Kenya. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
