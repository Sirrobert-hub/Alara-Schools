import { prisma } from "@/lib/prisma";
import { TeacherRegisterClient } from "@/components/TeacherRegisterClient";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      assignments: {
        include: { subject: true, classroom: true },
      },
    },
  });

  const formattedTeachers = teachers.map((t) => ({
    id: t.id,
    tscNumber: t.tscNumber,
    firstName: t.firstName,
    lastName: t.lastName,
    gender: t.gender,
    email: t.email,
    phone: t.phone,
    assignedClasses: Array.from(new Set(t.assignments.map((a) => a.classroom.name))),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Teaching Staff & Roster</h1>
        <p className="mt-2 text-slate-600">Manage educators, subject allocations, and CSV batch import.</p>
      </div>

      <TeacherRegisterClient teachers={formattedTeachers} />
    </div>
  );
}
