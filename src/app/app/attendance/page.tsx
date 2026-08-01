import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { markAttendance } from "@/app/actions";
import { Role, AttendanceStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
];

async function saveAttendance(formData: FormData) {
  "use server";
  const classroomId = formData.get("classroomId")?.toString();
  const termId = formData.get("termId")?.toString();
  const date = formData.get("date")?.toString();
  if (!classroomId || !termId || !date) throw new Error("Classroom, term, and date are required");

  const rows = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("status-"))
    .map(([key, value]) => ({
      studentId: key.replace("status-", ""),
      status: value.toString() as AttendanceStatus,
      remarks: formData.get(`remarks-${key.replace("status-", "")}`)?.toString() || undefined,
    }));

  await markAttendance(classroomId, termId, date, rows);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classroomId?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const role = session?.user?.role;
  const canEdit = role === Role.ADMIN || role === Role.DEPUTY || role === Role.CLASS_TEACHER;

  const settings = await prisma.schoolSetting.findFirst();
  const today = new Date().toISOString().slice(0, 10);
  const date = sp?.date || today;

  let classrooms = await prisma.classRoom.findMany({
    orderBy: { name: "asc" },
    include: { classLevel: true, stream: true },
  });

  // Class teachers only see their own classroom.
  if (role === Role.CLASS_TEACHER && session?.user?.teacherId) {
    classrooms = classrooms.filter((c) => c.classTeacherId === session.user.teacherId);
  }

  const classroomId = sp?.classroomId || classrooms[0]?.id;
  const selectedClassroom = classroomId ? classrooms.find((c) => c.id === classroomId) : null;

  const students = classroomId
    ? await prisma.student.findMany({
        where: { classroomId, active: true },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          attendance: {
            where: { date: new Date(date) },
          },
        },
      })
    : [];

  const presentCount = students.filter((s) => s.attendance[0]?.status === "PRESENT").length;
  const recordedCount = students.filter((s) => s.attendance[0]).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-2 text-slate-600">Mark the daily register for your classroom.</p>
      </div>

      <div className="card">
        <form method="get" className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="classroomId">Classroom</label>
            <select id="classroomId" name="classroomId" className="input" defaultValue={classroomId ?? ""}>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="date">Date</label>
            <input id="date" name="date" type="date" className="input" defaultValue={date} max={today} />
          </div>
          <button type="submit" className="btn-primary self-end">Load register</button>
        </form>
      </div>

      {selectedClassroom && students.length > 0 ? (
        <div className="card">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedClassroom.name}</h2>
              <p className="text-sm text-slate-600">{formatDate(new Date(date))}</p>
            </div>
            <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {recordedCount}/{students.length} recorded · {presentCount} present
            </p>
          </div>

          <form action={saveAttendance} className="mt-6 space-y-4">
            <input type="hidden" name="classroomId" value={selectedClassroom.id} />
            <input type="hidden" name="termId" value={settings?.currentTermId ?? ""} />
            <input type="hidden" name="date" value={date} />
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const existing = student.attendance[0];
                    return (
                      <tr key={student.id}>
                        <td>{student.firstName} {student.lastName}</td>
                        <td>
                          <select
                            name={`status-${student.id}`}
                            defaultValue={existing?.status ?? "PRESENT"}
                            className="input"
                            disabled={!canEdit}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            name={`remarks-${student.id}`}
                            defaultValue={existing?.remarks ?? ""}
                            className="input"
                            placeholder="Optional"
                            disabled={!canEdit}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {canEdit ? (
              !settings?.currentTermId ? (
                <p className="text-sm text-red-600">Set the current term in Settings before recording attendance.</p>
              ) : (
                <button type="submit" className="btn-primary">Save register</button>
              )
            ) : (
              <p className="text-sm text-slate-500">You have view-only access to attendance.</p>
            )}
          </form>
        </div>
      ) : (
        <div className="card">
          <p className="text-slate-600">
            {classrooms.length === 0
              ? "No classroom is assigned to you yet."
              : "No active students found for this classroom."}
          </p>
        </div>
      )}
    </div>
  );
}
