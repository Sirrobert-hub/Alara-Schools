import { prisma } from "@/lib/prisma";
import { gradeFromScore } from "@/lib/grading";
import { MarksGridClient } from "@/components/MarksGridClient";

export default async function MarksPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string; subjectId?: string }>;
}) {
  const sp = await searchParams;
  const exams = await prisma.examination.findMany({
    orderBy: { createdAt: "desc" },
    include: { classroom: true, academicYear: true, term: true },
  });
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  const examId = sp?.examId || (exams[0]?.id ?? "");
  const subjectId = sp?.subjectId || (subjects[0]?.id ?? "");

  const selectedExam = examId
    ? await prisma.examination.findUnique({
        where: { id: examId },
        include: { classroom: true, academicYear: true, term: true },
      })
    : null;

  const selectedSubject = subjectId
    ? await prisma.subject.findUnique({ where: { id: subjectId } })
    : null;

  const dbStudents = selectedExam
    ? await prisma.student.findMany({
        where: selectedExam.classroomId ? { classroomId: selectedExam.classroomId } : undefined,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          marks: {
            where: { examinationId: selectedExam.id, subjectId: subjectId || undefined },
          },
        },
      })
    : [];

  const initialRows = dbStudents.map((st) => {
    const mark = st.marks[0];
    const score = mark?.score ?? null;
    const grade = gradeFromScore(score)?.band ?? null;
    const remarks = grade ? getCBCRemarks(grade) : "";
    return {
      studentId: st.id,
      admissionNo: st.admissionNo,
      name: `${st.firstName} ${st.lastName}`,
      score,
      grade,
      remarks,
    };
  });

  const missingCount = initialRows.filter((r) => r.score === null).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Excel-Style Marks Entry Engine</h1>
        <p className="mt-2 text-slate-600">Select an exam session and subject area to open the keyboard-optimized grid.</p>
      </div>

      <div className="card">
        <form method="get" className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="examId">Select Exam Session</label>
            <select id="examId" name="examId" className="input text-xs font-semibold" defaultValue={examId}>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.classroom?.name ?? "All Grades"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="subjectId">Select Learning Area</label>
            <select id="subjectId" name="subjectId" className="input text-xs font-semibold" defaultValue={subjectId}>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full justify-center text-xs">
              🔍 Load Marks Grid
            </button>
          </div>
        </form>
      </div>

      {selectedExam && selectedSubject ? (
        <>
          {missingCount > 0 && (
            <div className="card border-amber-300 bg-amber-50 text-amber-900 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <strong className="font-bold">Missing Marks Alert:</strong> {missingCount} student(s) still need scores entered for {selectedSubject.name}.
              </div>
            </div>
          )}

          <MarksGridClient
            examId={selectedExam.id}
            subjectId={selectedSubject.id}
            examName={selectedExam.name}
            subjectName={selectedSubject.name}
            maxScore={selectedExam.maxScore}
            isLocked={selectedExam.status === "LOCKED"}
            initialRows={initialRows}
          />
        </>
      ) : (
        <div className="card py-12 text-center text-slate-400">
          <p>Please select an examination session and learning area above.</p>
        </div>
      )}
    </div>
  );
}

function getCBCRemarks(grade: string): string {
  if (grade.startsWith("EE")) return "Exceeds Expectations - Outstanding Mastery";
  if (grade.startsWith("ME")) return "Meets Expectations - Good Understanding";
  if (grade.startsWith("AE")) return "Approaching Expectations - Requires Practice";
  if (grade.startsWith("BE")) return "Below Expectations - Needs Targeted Support";
  return "";
}
