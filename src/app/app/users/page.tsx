import { prisma } from "@/lib/prisma";
import { createUser, resetUserPassword, toggleUserActive } from "@/app/actions";
import { Role } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  PRINCIPAL: "Principal",
  DEPUTY: "Deputy",
  CLASS_TEACHER: "Class teacher",
  SUBJECT_TEACHER: "Subject teacher",
  PARENT: "Parent / Guardian",
};

async function createAccount(formData: FormData) {
  "use server";
  await createUser({
    username: formData.get("username")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    role: formData.get("role")?.toString() as Role,
    teacherId: formData.get("teacherId")?.toString() || undefined,
  });
}

async function resetPassword(formData: FormData) {
  "use server";
  const userId = formData.get("userId")?.toString();
  if (userId) await resetUserPassword(userId);
}

async function toggleActive(formData: FormData) {
  "use server";
  const userId = formData.get("userId")?.toString();
  if (userId) await toggleUserActive(userId);
}

export default async function UsersPage() {
  const [users, teachers] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ role: "asc" }, { username: "asc" }] }),
    prisma.teacher.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Users</h1>
        <p className="mt-2 text-slate-600">Create accounts, reset passwords, and manage active users.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Admin user management</h2>
        <div className="table-wrap mt-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{ROLE_LABELS[user.role]}</td>
                  <td>{user.active ? "Active" : "Inactive"}</td>
                  <td className="flex flex-wrap gap-2">
                    <form action={resetPassword}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="btn-ghost text-slate-700">Reset password</button>
                    </form>
                    <form action={toggleActive}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="btn-ghost text-amber-600">{user.active ? "Deactivate" : "Activate"}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Create new user</h2>
        <form action={createAccount} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" name="username" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" name="name" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="role">Role</label>
            <select id="role" name="role" className="input" required>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="teacherId">Linked teacher</label>
            <select id="teacherId" name="teacherId" className="input">
              <option value="">No teacher account</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary lg:col-span-2">Create user</button>
        </form>
      </div>
    </div>
  );
}
