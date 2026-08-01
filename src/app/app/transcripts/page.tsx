import { prisma } from "@/lib/prisma";
import { TranscriptPdf } from "@/components/TranscriptPdf";
import { gradeFromScore } from "@/lib/grading";

export default async function TranscriptsPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const sp = await searchParams;
  const students = await prisma.student.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] });
  const selectedStudent = sp?.studentId ? await prisma.student.findUnique({ where: { id: sp.studentId }, include: { classroom: true, marks: { include: { subject: true, examination: true } } } }) : null;

  const records = selectedStudent
    ? selectedStudent.marks.map((mark) => ({
        exam: mark.examination.name,
        subject: mark.subject.name,
        score: mark.score,
        grade: mark.score === null ? "—" : gradeFromScore(mark.score)?.band ?? "—",
      }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Transcripts</h1>
        <p className="mt-2 text-slate-600">Select a student to review multi-term performance and export a transcript.</p>
      </div>

      <div className="card">
        <form method="get" className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="studentId">Student</label>
            <select id="studentId" name="studentId" className="input" defaultValue={sp?.studentId ?? ""}>
              <option value="">Choose student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary self-end">Load transcript</button>
        </form>
      </div>

      {selectedStudent ? (
        <div className="card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
              <p className="text-sm text-slate-600">{selectedStudent.classroom.name}</p>
            </div>
            <TranscriptPdf
              schoolName="ALara Primary & Junior Secondary School"
              studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
              admissionNo={selectedStudent.admissionNo}
              classroom={selectedStudent.classroom.name}
              records={records}
            />
          </div>
          <div className="mt-6 table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {records.map((entry, index) => (
                  <tr key={`${entry.exam}-${entry.subject}-${index}`}>
                    <td>{entry.exam}</td>
                    <td>{entry.subject}</td>
                    <td>{entry.score ?? "—"}</td>
                    <td>{entry.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="text-slate-600">Choose a student to preview the transcript.</p>
        </div>
      )}
    </div>
  );
}
