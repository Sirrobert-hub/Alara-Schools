import { prisma } from "@/lib/prisma";
import { gradeFromScore } from "@/lib/grading";
import { ReportCardPdf } from "@/components/ReportCardPdf";

async function getStudentsForReport(examId: string, classroomId: string | null) {
  const students = await prisma.student.findMany({
    where: classroomId ? { classroomId } : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      classroom: true,
      marks: {
        where: { examinationId: examId },
        include: { subject: true },
      },
    },
  });

  return students.map((student) => ({
    admissionNo: student.admissionNo,
    name: `${student.firstName} ${student.lastName}`,
    parentName: student.parentName,
    marks: student.marks.map((mark) => ({
      subject: mark.subject.name,
      score: mark.score,
      grade: mark.score === null ? "—" : gradeFromScore(mark.score)?.band ?? "—",
    })),
  }));
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ examId?: string; classroomId?: string }> }) {
  const sp = await searchParams;
  const [exams, classrooms] = await Promise.all([
    prisma.examination.findMany({ orderBy: { createdAt: "desc" }, include: { classroom: true, academicYear: true, term: true } }),
    prisma.classRoom.findMany({ orderBy: { name: "asc" } }),
  ]);

  const selectedExam = sp?.examId
    ? await prisma.examination.findUnique({ where: { id: sp.examId }, include: { classroom: true } })
    : null;
  const classroomId = sp?.classroomId ?? null;
  const students = selectedExam ? await getStudentsForReport(selectedExam.id, classroomId) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Report cards</h1>
        <p className="mt-2 text-slate-600">Pick an exam and classroom to generate report cards for printing or download.</p>
      </div>

      <div className="card">
        <form method="get" className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="examId">Exam</label>
            <select id="examId" name="examId" className="input" defaultValue={sp?.examId ?? ""}>
              <option value="">Choose exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="classroomId">Classroom</label>
            <select id="classroomId" name="classroomId" className="input" defaultValue={sp?.classroomId ?? ""}>
              <option value="">All classes</option>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary self-end">Load report data</button>
        </form>
      </div>

      {selectedExam ? (
        <div className="card space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedExam.name}</h2>
              <p className="text-sm text-slate-600">{selectedExam.classroom?.name ?? "All classes"}</p>
            </div>
            <div className="flex gap-3">
              <a
                href={`/api/reports/export?examId=${selectedExam.id}${classroomId ? `&classroomId=${classroomId}` : ""}`}
                className="btn-outline"
              >
                Export CSV
              </a>
              <ReportCardPdf
                schoolName="ALara Primary & Junior Secondary School"
                className={selectedExam.classroom?.name ?? "School"}
                examName={selectedExam.name}
                students={students}
              />
            </div>
          </div>
          <p className="text-sm text-slate-600">{students.length} student report(s) will be included in the PDF export.</p>
        </div>
      ) : (
        <div className="card">
          <p className="text-slate-600">Select an exam to preview report card generation.</p>
        </div>
      )}
    </div>
  );
}
