import { prisma } from "@/lib/prisma";
import { upsertStudent } from "@/app/actions";
import { StudentRegisterClient } from "@/components/StudentRegisterClient";
import { gradeFromScore } from "@/lib/grading";

async function saveStudent(formData: FormData) {
  "use server";
  const classroomId = formData.get("classroomId")?.toString() ?? "";
  await upsertStudent({
    admissionNo: formData.get("admissionNo")?.toString() ?? "",
    upi: formData.get("upi")?.toString() ?? undefined,
    firstName: formData.get("firstName")?.toString() ?? "",
    lastName: formData.get("lastName")?.toString() ?? "",
    middleName: formData.get("middleName")?.toString() ?? undefined,
    gender: (formData.get("gender")?.toString() as "MALE" | "FEMALE") ?? "MALE",
    classroomId,
    parentName: formData.get("parentName")?.toString() ?? undefined,
    parentPhone: formData.get("parentPhone")?.toString() ?? undefined,
    house: formData.get("house")?.toString() ?? undefined,
    kcpeOrKpseaNo: formData.get("kcpeOrKpseaNo")?.toString() ?? undefined,
    medicalNotes: formData.get("medicalNotes")?.toString() ?? undefined,
    dateOfBirth: formData.get("dateOfBirth")?.toString() ?? undefined,
  });
}

export default async function StudentsPage() {
  const [dbStudents, classrooms] = await Promise.all([
    prisma.student.findMany({
      orderBy: [{ classroom: { classLevel: { orderIndex: "asc" } } }, { lastName: "asc" }, { firstName: "asc" }],
      include: {
        classroom: { include: { classLevel: true, stream: true } },
        marks: { select: { score: true } },
        feePayments: { select: { amount: true } },
      },
    }),
    prisma.classRoom.findMany({ include: { classLevel: true, stream: true }, orderBy: { name: "asc" } }),
  ]);

  const studentsList = dbStudents.map((s) => {
    const scores = s.marks.map((m) => m.score).filter((score): score is number => typeof score === "number");
    const meanScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const meanGrade = meanScore !== null ? gradeFromScore(meanScore)?.band ?? null : null;

    const totalPaid = s.feePayments.reduce((acc, p) => acc + p.amount, 0);
    const totalBilled = s.classroom.classLevel.feePerTerm || 15000;

    return {
      id: s.id,
      admissionNo: s.admissionNo,
      upi: s.upi,
      firstName: s.firstName,
      lastName: s.lastName,
      gender: s.gender,
      classroomId: s.classroomId,
      classroomName: s.classroom.name,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      totalBilled,
      totalPaid,
      meanScore,
      meanGrade,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Learners Register & CSV Import</h1>
        <p className="mt-2 text-slate-600">Search learner roster, inspect fee statuses, or bulk import via CSV.</p>
      </div>

      <StudentRegisterClient students={studentsList} classrooms={classrooms} />

      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-2">➕ Register Single Learner</h2>
        <form action={saveStudent} className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="admissionNo">Admission number</label>
            <input id="admissionNo" name="admissionNo" className="input" placeholder="e.g. ALA26901" required />
          </div>
          <div>
            <label className="label" htmlFor="upi">NEMIS UPI</label>
            <input id="upi" name="upi" className="input" placeholder="e.g. UPI20269901" />
          </div>
          <div>
            <label className="label" htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="classroomId">Classroom</label>
            <select id="classroomId" name="classroomId" className="input" required>
              <option value="">Select class</option>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="gender">Gender</label>
            <select id="gender" name="gender" className="input" defaultValue="MALE">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" type="date" name="dateOfBirth" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="parentName">Parent / guardian name</label>
            <input id="parentName" name="parentName" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="parentPhone">Parent phone</label>
            <input id="parentPhone" name="parentPhone" className="input" placeholder="+2547..." />
          </div>
          <div>
            <label className="label" htmlFor="house">House</label>
            <input id="house" name="house" className="input" placeholder="e.g. Elgon" />
          </div>
          <div className="lg:col-span-2">
            <label className="label" htmlFor="medicalNotes">Medical notes</label>
            <textarea id="medicalNotes" name="medicalNotes" className="input min-h-[100px]" />
          </div>
          <button type="submit" className="btn-primary lg:col-span-2">Save Learner Record</button>
        </form>
      </div>
    </div>
  );
}
