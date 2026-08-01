import { fullName, formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { promoteStudent } from "@/app/actions";
import { notFound } from "next/navigation";

async function promote(formData: FormData) {
  "use server";
  const studentId = formData.get("studentId")?.toString();
  if (!studentId) throw new Error("Student ID missing");
  await promoteStudent(studentId);
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id: id },
    include: {
      classroom: { include: { classLevel: true, stream: true } },
      marks: { include: { subject: true, examination: true }, orderBy: { updatedAt: "desc" } },
    },
  });

  if (!student) return notFound();

  const marks = student.marks.filter((mark) => typeof mark.score === "number");
  const scores = marks.map((mark) => mark.score as number);
  const average = scores.length ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10 : null;
  const bestScore = scores.length ? Math.max(...scores) : null;
  const worstScore = scores.length ? Math.min(...scores) : null;
  const submittedCount = marks.filter((mark) => mark.submitted).length;

  const attendanceRecords = await prisma.attendance.findMany({ where: { studentId: student.id } });
  const attendanceTotal = attendanceRecords.length;
  const attendancePresent = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 1000) / 10 : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{fullName(student)}</h1>
          <p className="mt-2 text-slate-600">{student.classroom.name} · {student.gender} · Admission {student.admissionNo}</p>
        </div>
        <form action={promote} className="flex items-center gap-3">
          <input type="hidden" name="studentId" value={student.id} />
          <button type="submit" className="btn-accent" disabled={student.promoted}>
            {student.promoted ? "Already promoted" : "Promote learner"}
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Academic summary</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <p><strong>Recorded exams:</strong> {student.marks.length}</p>
            <p><strong>Submitted marks:</strong> {submittedCount}</p>
            <p><strong>Average score:</strong> {average ?? "—"}</p>
            <p><strong>Best score:</strong> {bestScore ?? "—"}</p>
            <p><strong>Lowest score:</strong> {worstScore ?? "—"}</p>
            <p><strong>Attendance rate:</strong> {attendanceRate !== null ? `${attendanceRate}% (${attendancePresent}/${attendanceTotal} days)` : "No records yet"}</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <p><strong>UPI:</strong> {student.upi ?? "—"}</p>
            <p><strong>Date of birth:</strong> {formatDate(student.dateOfBirth)}</p>
            <p><strong>Parent / guardian:</strong> {student.parentName ?? "—"}</p>
            <p><strong>Phone:</strong> {student.parentPhone ?? "—"}</p>
            <p><strong>KCPE / KPSEA:</strong> {student.kcpeOrKpseaNo ?? "—"}</p>
            <p><strong>House:</strong> {student.house ?? "—"}</p>
            <p><strong>Medical notes:</strong> {student.medicalNotes ?? "None"}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Academic details</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <p><strong>Classroom:</strong> {student.classroom.name}</p>
            <p><strong>Class teacher:</strong> {student.classroom.classTeacherId ?? "—"}</p>
            <p><strong>Promoted:</strong> {student.promoted ? "Yes" : "No"}</p>
            <p><strong>Record updated:</strong> {formatDate(student.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Recent marks</h2>
        <div className="table-wrap mt-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {student.marks.map((mark) => (
                <tr key={mark.id}>
                  <td>{mark.examination.name}</td>
                  <td>{mark.subject.name}</td>
                  <td>{mark.score ?? "—"}</td>
                  <td>{mark.submitted ? "Submitted" : "Draft"}</td>
                  <td>{formatDate(mark.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
