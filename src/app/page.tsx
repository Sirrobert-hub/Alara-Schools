import Link from "next/link";

const KNEC_SCALE = [
  { band: "EE1", range: "90–100", label: "Exceeds Expectations", color: "from-emerald-500 to-green-600", light: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { band: "EE2", range: "75–89", label: "Exceeds Expectations", color: "from-green-500 to-teal-600", light: "bg-green-50 border-green-200 text-green-800" },
  { band: "ME1", range: "58–74", label: "Meets Expectations", color: "from-blue-500 to-indigo-600", light: "bg-blue-50 border-blue-200 text-blue-800" },
  { band: "ME2", range: "41–57", label: "Meets Expectations", color: "from-sky-500 to-blue-600", light: "bg-sky-50 border-sky-200 text-sky-800" },
  { band: "AE1", range: "31–40", label: "Approaching Expectations", color: "from-amber-500 to-orange-600", light: "bg-amber-50 border-amber-200 text-amber-800" },
  { band: "AE2", range: "21–30", label: "Approaching Expectations", color: "from-orange-500 to-amber-600", light: "bg-orange-50 border-orange-200 text-orange-800" },
  { band: "BE1", range: "11–20", label: "Below Expectations", color: "from-rose-500 to-red-600", light: "bg-rose-50 border-rose-200 text-rose-800" },
  { band: "BE2", range: "0–10", label: "Below Expectations", color: "from-red-700 to-rose-800", light: "bg-red-50 border-red-200 text-red-800" },
];

const MODULES = [
  { icon: "🎓", title: "Learners Register", desc: "CBC-aligned student records with UPI, KPSEA, and class assignments. Bulk CSV import." },
  { icon: "👨‍🏫", title: "Teaching Staff", desc: "TSC-linked teacher profiles with subject & class assignment management." },
  { icon: "📝", title: "Exam Sessions", desc: "Multi-type exam management: CATs, Midterms, End-Terms & National exams." },
  { icon: "✍️", title: "Marks Entry Grid", desc: "Excel-style keyboard-optimised marks entry with instant KNEC grade calculation." },
  { icon: "💳", title: "Fee Accounting", desc: "M-Pesa, bank & cash receipts. Per-grade fee structures with balance tracking." },
  { icon: "✓", title: "Daily Attendance", desc: "Present, absent, late, excused. Class-level attendance register per term." },
  { icon: "📄", title: "Report Cards", desc: "ALara letterhead report cards with teacher & principal remarks. PDF export." },
  { icon: "🏆", title: "Transcripts", desc: "Multi-term academic transcripts for transfers, promotions and parent access." },
  { icon: "📊", title: "Visual Analytics", desc: "KNEC grade distribution, subject performance radar, and school-wide trends." },
  { icon: "📢", title: "Noticeboard & SMS", desc: "School announcements, event notices, and SMS broadcast to parents." },
  { icon: "📜", title: "Audit Logs", desc: "Complete user activity trail for security and accountability." },
  { icon: "⚙", title: "System Settings", desc: "School profile, academic year & term control, and user account management." },
];


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
          <div className="hidden items-center gap-8 text-sm text-blue-100 md:flex">
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#modules" className="hover:text-white transition">Modules</a>
            <a href="#knec" className="hover:text-white transition">KNEC Scale</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
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
            <a href="#modules" className="rounded-xl border border-white/40 px-8 py-3.5 font-medium text-white hover:bg-white/10 transition">
              View All Modules
            </a>
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

      {/* About */}
      <section id="about" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About ALara</p>
          <h2 className="font-display mt-2 max-w-2xl text-4xl font-bold text-slate-900">
            A school committed to excellence through digital transformation
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <div className="border-t-4 border-primary pt-6">
              <h3 className="font-display text-xl font-bold text-primary">🎯 Mission</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                To provide quality, holistic education that nurtures every learner&apos;s potential through innovative teaching and technology integration.
              </p>
            </div>
            <div className="border-t-4 border-amber-500 pt-6">
              <h3 className="font-display text-xl font-bold text-amber-700">🌟 Vision</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                To be a center of excellence in primary and junior secondary education, producing competent, globally competitive learners.
              </p>
            </div>
            <div className="border-t-4 border-emerald-500 pt-6">
              <h3 className="font-display text-xl font-bold text-emerald-700">💎 Core Values</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                <strong>Integrity</strong>, <strong>Excellence</strong>, <strong>Innovation</strong>, <strong>Inclusivity</strong>, and <strong>Collaboration</strong> — shaping future leaders from the grassroots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KNEC Scale */}
      <section id="knec" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Official Standard</p>
          <h2 className="font-display mt-2 text-4xl font-bold text-slate-900">
            KNEC 8-Point CBC Achievement Scale
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            All ALara SMIS reports use the official Kenya National Examinations Council 8-point grading system aligned to the Competency-Based Curriculum (CBC) for PP1–Grade 9.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {KNEC_SCALE.map((g) => (
              <div key={g.band} className={`rounded-2xl border p-5 ${g.light}`}>
                <div className={`inline-flex items-center rounded-xl bg-gradient-to-br ${g.color} px-3 py-1.5 text-sm font-black text-white shadow-sm`}>
                  {g.band}
                </div>
                <div className="mt-3 font-bold text-lg">{g.range}%</div>
                <div className="mt-1 text-sm font-medium opacity-80">{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Modules */}
      <section id="modules" className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">System Capabilities</p>
          <h2 className="font-display mt-2 text-4xl font-bold">
            12 Integrated School Management Modules
          </h2>
          <p className="mt-3 text-blue-200/70 max-w-2xl">
            From learner registration to fee accounting, marks entry to PDF report cards — every workflow is covered with role-based access control.
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                <div className="text-3xl mb-3">{m.icon}</div>
                <h3 className="font-display text-sm font-bold text-white">{m.title}</h3>
                <p className="mt-2 text-xs text-blue-100/70 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact */}
      <section id="contact" className="py-24 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
            <h2 className="font-display mt-2 text-4xl font-bold text-slate-900">Get in Touch</h2>
            <ul className="mt-8 space-y-4 text-slate-700">
              <li className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <span><strong>Phone:</strong> +254 712 345 678</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <span><strong>Email:</strong> info@alaraschools.ac.ke</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span><strong>Location:</strong> Suna East Sub-County, Migori County, Kenya</span>
              </li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <iframe
              title="ALara School Map"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Suna%20East%20Migori%20Kenya&t=&z=13&ie=UTF8&iwloc=&output=embed"
            />
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
          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition">System Login</Link></li>
              <li><a href="#modules" className="hover:text-white transition">Modules</a></li>
              <li><a href="#knec" className="hover:text-white transition">KNEC Scale</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
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
