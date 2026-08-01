import Link from "next/link";



export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-primary-dark/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-xl font-bold text-white">
            ALara<span className="text-amber-300">SMIS</span>
            <span className="ml-2 rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200">v5.0</span>
          </Link>

          <Link href="/login" className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-primary shadow hover:bg-amber-50 transition">
            Login →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient relative min-h-[100vh] overflow-hidden pt-28 pb-20">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(245,158,11,0.3), transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 35%), radial-gradient(circle at 60% 80%, rgba(96,165,250,0.2), transparent 35%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-4 pt-16 md:pt-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Suna East Sub-County · Migori County · Kenya
          </p>
          <h1 className="font-display max-w-4xl text-5xl font-bold leading-[1.05] text-white md:text-7xl">
            ALara Primary &amp;<br />Junior Secondary School
          </h1>
          <p className="mt-6 max-w-xl text-xl text-blue-100 md:text-2xl">
            Academic Excellence Through Digital Intelligence
          </p>
          <p className="mt-3 text-blue-200/70 text-base">
            Enterprise-grade School Management Information System — PP1 to Grade 9 CBC
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/login" className="rounded-xl bg-white px-8 py-3.5 font-semibold text-primary shadow-lg hover:bg-amber-50 transition">
              Access System →
            </Link>

          </div>

          {/* Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "1,200+", label: "Learners Enrolled" },
              { value: "48", label: "Teaching Staff" },
              { value: "22", label: "Classrooms" },
              { value: "8-Point", label: "KNEC CBC Scale" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm text-center">
                <div className="font-display text-2xl font-black text-white">{m.value}</div>
                <div className="text-xs font-semibold text-blue-200/80 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-white">
              ALara<span className="text-amber-300">SMIS</span>
              <span className="ml-1.5 text-xs text-amber-300/60">v5.0</span>
            </div>
            <p className="mt-2 text-sm">ALara Primary &amp; Junior Secondary School</p>
            <p className="mt-1 text-xs text-slate-500">Suna East Sub-County · Migori County · Kenya</p>
          </div>

          <div className="text-sm">
            <p className="text-slate-400">CBC · KNEC 8-Point · KICD Competency Bands</p>
            <p className="mt-4 text-slate-500">&copy; {new Date().getFullYear()} ALara School Management Information System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
