import Link from "next/link";

const features = [
  { title: "Student Results", desc: "Enter, calculate, and publish CBC-aligned examination results." },
  { title: "Performance Analytics", desc: "Class, subject, teacher, and school-wide insights with charts." },
  { title: "Progress Reports", desc: "Auto-generated report cards with ranks, grades, and remarks." },
  { title: "Transcripts", desc: "Multi-term academic history for transfers and records." },
  { title: "Teacher Portal", desc: "Role-based marks entry with deadlines and submission locks." },
  { title: "Secure Login", desc: "Encrypted passwords, session control, and permission checks." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-primary-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-xl font-bold text-white">
            ALara<span className="text-amber-300">SMIS</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-blue-100 md:flex">
            <a href="#about" className="hover:text-white">About</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#screenshots" className="hover:text-white">System</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
          <Link href="/login" className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-primary hover:bg-amber-50">
            Login
          </Link>
        </div>
      </nav>

      <section className="hero-gradient relative min-h-[100vh] overflow-hidden pt-28 pb-20">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(245,158,11,0.25), transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 35%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-4 pt-16 md:pt-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Migori · Suna East · Kenya
          </p>
          <h1 className="font-display max-w-4xl text-5xl font-bold leading-[1.05] text-white md:text-7xl">
            ALara Primary & Junior Secondary School
          </h1>
          <p className="mt-6 max-w-xl text-xl text-blue-100 md:text-2xl">
            Academic Excellence Through Digital Intelligence
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/login" className="rounded-xl bg-white px-8 py-3.5 font-semibold text-primary shadow-lg hover:bg-amber-50">
              Login
            </Link>
            <a href="#contact" className="rounded-xl border border-white/40 px-8 py-3.5 font-medium text-white hover:bg-white/10">
              Contact School
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-6 text-sm text-blue-100/80">
            <span>CBC aligned</span>
            <span>KNEC 8-point scale</span>
            <span>KICD competency bands</span>
          </div>
        </div>
      </section>

      <section id="about" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h2 className="font-display mt-2 max-w-2xl text-4xl font-bold text-slate-900">
            A school committed to excellence through digital transformation
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="font-display text-xl font-bold text-primary">Mission</h3>
              <p className="mt-3 text-slate-600">
                To provide quality, holistic education that nurtures every learner&apos;s potential through innovative teaching and technology integration.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-accent-dark">Vision</h3>
              <p className="mt-3 text-slate-600">
                To be a center of excellence in primary and junior secondary education, producing competent, globally competitive learners.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-emerald-700">Core Values</h3>
              <p className="mt-3 text-slate-600">
                Integrity, Excellence, Innovation, Inclusivity, and Collaboration — shaping future leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="font-display mt-2 text-4xl font-bold text-slate-900">
            Everything you need to manage school performance
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="border-t-2 border-primary pt-6">
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="screenshots" className="bg-primary-dark py-24 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Inside the system</p>
          <h2 className="font-display mt-2 text-4xl font-bold">Dashboards, marks, reports & analytics</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {["Role dashboards", "Excel-like marks entry", "CBC report cards"].map((t) => (
              <div key={t} className="rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur">
                <div className="mb-6 h-32 rounded-xl bg-gradient-to-br from-primary-light/40 to-amber-400/20" />
                <h3 className="font-display text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-blue-100/80">
                  Live data from the ALara SMIS database — not a static mockup.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
            <h2 className="font-display mt-2 text-4xl font-bold">Get in touch</h2>
            <ul className="mt-8 space-y-4 text-slate-700">
              <li><strong>Phone:</strong> +254 712 345 678</li>
              <li><strong>Email:</strong> info@alaraschools.ac.ke</li>
              <li><strong>Location:</strong> Suna East Sub-County, Migori County, Kenya</li>
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

      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-white">
              ALara<span className="text-amber-300">SMIS</span>
            </div>
            <p className="mt-2 text-sm">ALara Primary & Junior Secondary School</p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Quick links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div className="text-sm">
            <p>Privacy Policy · Terms of Use</p>
            <p className="mt-4">&copy; {new Date().getFullYear()} ALara School Management Information System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
