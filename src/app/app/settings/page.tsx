import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/app/actions";

async function saveSettings(formData: FormData) {
  "use server";
  await updateSettings({
    name: formData.get("name")?.toString() ?? "",
    county: formData.get("county")?.toString() ?? "",
    subCounty: formData.get("subCounty")?.toString() ?? "",
    country: formData.get("country")?.toString() ?? "Kenya",
    phone: formData.get("phone")?.toString() ?? undefined,
    email: formData.get("email")?.toString() ?? undefined,
    address: formData.get("address")?.toString() ?? undefined,
    currentYearId: formData.get("currentYearId")?.toString() || undefined,
    currentTermId: formData.get("currentTermId")?.toString() || undefined,
    mission: formData.get("mission")?.toString() ?? undefined,
    vision: formData.get("vision")?.toString() ?? undefined,
    coreValues: formData.get("coreValues")?.toString() ?? undefined,
  });
}

export default async function SettingsPage() {
  const [settings, years, terms] = await Promise.all([
    prisma.schoolSetting.findFirst(),
    prisma.academicYear.findMany({ orderBy: { name: "asc" } }),
    prisma.term.findMany({ orderBy: [{ academicYearId: "asc" }, { termNumber: "asc" }] }),
  ]);

  if (!settings) {
    return (
      <div className="card">
        <h1 className="font-display text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">School settings are not configured yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">Update school profile, current year, and term for the system.</p>
      </div>

      <div className="card">
        <form action={saveSettings} className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">School name</label>
              <input id="name" name="name" className="input" defaultValue={settings.name} required />
            </div>
            <div>
              <label className="label" htmlFor="county">County</label>
              <input id="county" name="county" className="input" defaultValue={settings.county} required />
            </div>
            <div>
              <label className="label" htmlFor="subCounty">Sub-county</label>
              <input id="subCounty" name="subCounty" className="input" defaultValue={settings.subCounty} required />
            </div>
            <div>
              <label className="label" htmlFor="country">Country</label>
              <input id="country" name="country" className="input" defaultValue={settings.country} required />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" className="input" defaultValue={settings.phone ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" defaultValue={settings.email ?? ""} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="address">Address</label>
            <input id="address" name="address" className="input" defaultValue={settings.address ?? ""} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="currentYearId">Current academic year</label>
              <select id="currentYearId" name="currentYearId" className="input" defaultValue={settings.currentYearId ?? ""}>
                <option value="">Choose year</option>
                {years.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="currentTermId">Current term</label>
              <select id="currentTermId" name="currentTermId" className="input" defaultValue={settings.currentTermId ?? ""}>
                <option value="">Choose term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>{term.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="mission">Mission</label>
              <textarea id="mission" name="mission" className="input min-h-[120px]">{settings.mission ?? ""}</textarea>
            </div>
            <div>
              <label className="label" htmlFor="vision">Vision</label>
              <textarea id="vision" name="vision" className="input min-h-[120px]">{settings.vision ?? ""}</textarea>
            </div>
            <div>
              <label className="label" htmlFor="coreValues">Core values</label>
              <textarea id="coreValues" name="coreValues" className="input min-h-[120px]">{settings.coreValues ?? ""}</textarea>
            </div>
          </div>

          <button type="submit" className="btn-primary">Save settings</button>
        </form>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Backup and security</h2>
            <p className="mt-2 text-slate-600">Download a full snapshot of the live database. Every download is recorded in the audit log. Store it somewhere safe (e.g. Google Drive) — this file contains all student, teacher, and mark data.</p>
          </div>
          <a href="/api/admin/backup" className="btn-accent">Download backup</a>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Session timeout and secure login are enforced by NextAuth sessions, and administrator audit logs capture key system actions.
        </div>
      </div>
    </div>
  );
}
