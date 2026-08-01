import { ExamStatus, ExamTypeCode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createExamination, setExamStatus } from "@/app/actions";

const EXAM_TYPES = [
  { value: ExamTypeCode.CAT, label: "CAT" },
  { value: ExamTypeCode.MIDTERM, label: "Midterm" },
  { value: ExamTypeCode.END_TERM, label: "End term" },
  { value: ExamTypeCode.ASSESSMENT, label: "Assessment" },
  { value: ExamTypeCode.PROJECT, label: "Project" },
];

async function updateStatus(formData: FormData) {
  "use server";
  const id = formData.get("examId")?.toString();
  const status = formData.get("status")?.toString() as ExamStatus;
  if (!id || !status) throw new Error("Missing exam data");
  await setExamStatus(id, status);
}

async function createExam(formData: FormData) {
  "use server";
  await createExamination({
    name: formData.get("name")?.toString() ?? "",
    examType: formData.get("examType")?.toString() ?? ExamTypeCode.END_TERM,
    academicYearId: formData.get("academicYearId")?.toString() ?? "",
    termId: formData.get("termId")?.toString() ?? "",
    classroomId: formData.get("classroomId")?.toString() || undefined,
    deadline: formData.get("deadline")?.toString() || undefined,
    maxScore: Number(formData.get("maxScore")?.toString() ?? 100),
  });
}

export default async function ExaminationsPage() {
  const [exams, classrooms, years, terms] = await Promise.all([
    prisma.examination.findMany({
      orderBy: { createdAt: "desc" },
      include: { classroom: true, academicYear: true, term: true },
    }),
    prisma.classRoom.findMany({ orderBy: { name: "asc" } }),
    prisma.academicYear.findMany({ orderBy: { name: "asc" } }),
    prisma.term.findMany({ orderBy: [{ academicYearId: "asc" }, { termNumber: "asc" }], include: { academicYear: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Examinations</h1>
        <p className="mt-2 text-slate-600">Create and manage the exam lifecycle for the current academic year.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Exam list</h2>
        <div className="table-wrap mt-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Term</th>
                <th>Class</th>
                <th>Type</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{exam.name}</td>
                  <td>{exam.academicYear.name}</td>
                  <td>{exam.term.name}</td>
                  <td>{exam.classroom?.name ?? "All"}</td>
                  <td>{exam.examType}</td>
                  <td>{exam.status}</td>
                  <td>{exam.deadline?.toLocaleDateString() ?? "—"}</td>
                  <td>
                    <form action={updateStatus} className="flex flex-wrap gap-2">
                      <input type="hidden" name="examId" value={exam.id} />
                      {exam.status !== ExamStatus.LOCKED ? (
                        <button type="submit" name="status" value={ExamStatus.LOCKED} className="btn-ghost text-amber-700">
                          Lock
                        </button>
                      ) : (
                        <button type="submit" name="status" value={ExamStatus.OPEN} className="btn-ghost text-slate-700">
                          Reopen
                        </button>
                      )}
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Create new exam</h2>
        <form action={createExam} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Exam name</label>
            <input id="name" name="name" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="examType">Exam type</label>
            <select id="examType" name="examType" className="input" defaultValue={ExamTypeCode.END_TERM}>
              {EXAM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="academicYearId">Academic year</label>
            <select id="academicYearId" name="academicYearId" className="input" required>
              <option value="">Choose year</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>{year.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="termId">Term</label>
            <select id="termId" name="termId" className="input" required>
              <option value="">Choose term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>{term.academicYear.name} — {term.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="classroomId">Classroom (optional)</label>
            <select id="classroomId" name="classroomId" className="input">
              <option value="">All classes</option>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="maxScore">Maximum score</label>
            <input id="maxScore" name="maxScore" type="number" className="input" defaultValue={100} min={1} />
          </div>
          <div>
            <label className="label" htmlFor="deadline">Deadline</label>
            <input id="deadline" name="deadline" type="date" className="input" />
          </div>
          <button type="submit" className="btn-primary lg:col-span-2">Create exam</button>
        </form>
      </div>
    </div>
  );
}
