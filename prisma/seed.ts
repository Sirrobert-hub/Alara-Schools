import { PrismaClient, Role, Gender, ExamTypeCode, ExamStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Admin123";

const FIRST_NAMES_M = [
  "Brian", "David", "Kevin", "Samuel", "Peter", "James", "Daniel", "Joseph",
  "Michael", "Collins", "Victor", "Felix", "George", "Ian", "Mark", "Paul",
];
const FIRST_NAMES_F = [
  "Amanda", "Faith", "Mercy", "Grace", "Akinyi", "Atieno", "Achieng", "Awino",
  "Sharon", "Nancy", "Esther", "Ruth", "Jane", "Mary", "Lilian", "Beatrice",
];
const LAST_NAMES = [
  "Odhiambo", "Omondi", "Otieno", "Okoth", "Ouma", "Owino", "Ochieng", "Onyango",
  "Adhiambo", "Akinyi", "Mwangi", "Wanjiku", "Kamau", "Njeri", "Kiprop", "Cherono",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function scoreFor(seed: number): number {
  // Deterministic-ish scores between 25 and 95
  const v = ((seed * 37) % 71) + 25;
  return Math.min(95, Math.max(25, v));
}

async function main() {
  console.log("Seeding ALara SMIS...");

  await prisma.mark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.classRoom.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.classLevel.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.schoolSetting.deleteMany();
  await prisma.auditLog.deleteMany();

  const hash = await bcrypt.hash(PASSWORD, 10);

  await prisma.schoolSetting.create({
    data: {
      name: "ALara Primary & Junior Secondary School",
      county: "Migori",
      subCounty: "Suna East",
      country: "Kenya",
      phone: "+254 712 345 678",
      email: "info@alaraschools.ac.ke",
      address: "Suna East Sub-County, Migori County, Kenya",
      mission:
        "To provide quality, holistic education that nurtures every learner's potential through innovative teaching and technology integration.",
      vision:
        "To be a center of excellence in primary and junior secondary education, producing competent, globally competitive learners.",
      coreValues: "Integrity, Excellence, Innovation, Inclusivity, and Collaboration",
    },
  });

  const year2025 = await prisma.academicYear.create({
    data: { name: "2025", active: false },
  });
  const year2026 = await prisma.academicYear.create({
    data: { name: "2026", active: true },
  });

  const terms2025 = await Promise.all(
    [1, 2, 3].map((n) =>
      prisma.term.create({
        data: {
          name: `Term ${n}`,
          termNumber: n,
          academicYearId: year2025.id,
          active: false,
        },
      })
    )
  );

  const terms2026 = await Promise.all(
    [1, 2, 3].map((n) =>
      prisma.term.create({
        data: {
          name: `Term ${n}`,
          termNumber: n,
          academicYearId: year2026.id,
          active: n === 2,
        },
      })
    )
  );

  const grade7 = await prisma.classLevel.create({
    data: { name: "Grade 7", orderIndex: 7 },
  });
  const grade8 = await prisma.classLevel.create({
    data: { name: "Grade 8", orderIndex: 8 },
  });
  const streamA = await prisma.stream.create({ data: { name: "A" } });
  const streamB = await prisma.stream.create({ data: { name: "B" } });

  const subjects = await Promise.all(
    [
      { name: "Mathematics", code: "MATH" },
      { name: "English", code: "ENG" },
      { name: "Kiswahili", code: "KIS" },
      { name: "Integrated Science", code: "SCI" },
      { name: "Social Studies", code: "SST" },
      { name: "CRE", code: "CRE" },
      { name: "Agriculture", code: "AGR" },
      { name: "Business Studies", code: "BST" },
    ].map((s) => prisma.subject.create({ data: s }))
  );

  const teachersData = [
    { tsc: "TSC/452301", first: "Alice", last: "Ouma", gender: Gender.FEMALE },
    { tsc: "TSC/381204", first: "John", last: "Ochieng", gender: Gender.MALE },
    { tsc: "TSC/410998", first: "Sarah", last: "Mwangi", gender: Gender.FEMALE },
    { tsc: "TSC/367712", first: "James", last: "Okello", gender: Gender.MALE },
    { tsc: "TSC/399441", first: "Grace", last: "Atieno", gender: Gender.FEMALE },
    { tsc: "TSC/422110", first: "Daniel", last: "Owino", gender: Gender.MALE },
  ];

  const teachers = [];
  for (const t of teachersData) {
    teachers.push(
      await prisma.teacher.create({
        data: {
          tscNumber: t.tsc,
          firstName: t.first,
          lastName: t.last,
          gender: t.gender,
          phone: `+2547${Math.floor(10000000 + Math.random() * 89999999)}`,
          email: `${t.first.toLowerCase()}.${t.last.toLowerCase()}@alaraschools.ac.ke`,
        },
      })
    );
  }

  const roomsSpec = [
    { name: "Grade 7A", level: grade7, stream: streamA, teacher: teachers[0] },
    { name: "Grade 7B", level: grade7, stream: streamB, teacher: teachers[3] },
    { name: "Grade 8A", level: grade8, stream: streamA, teacher: teachers[4] },
    { name: "Grade 8B", level: grade8, stream: streamB, teacher: teachers[5] },
  ];

  const classrooms = [];
  for (const r of roomsSpec) {
    classrooms.push(
      await prisma.classRoom.create({
        data: {
          name: r.name,
          classLevelId: r.level.id,
          streamId: r.stream.id,
          classTeacherId: r.teacher.id,
        },
      })
    );
  }

  // Assignments: each teacher gets subjects across rooms
  const assignmentPlan: Array<[number, number, number]> = [
    [1, 0, 0], [1, 0, 2], // Ochieng Math 7A, 8A
    [2, 1, 0], [2, 1, 1], // Mwangi Eng 7A, 7B
    [3, 2, 2], [3, 2, 3], // Okello Kis 8A, 8B
    [4, 3, 0], [4, 3, 1], // Atieno Sci
    [5, 4, 2], [5, 4, 3], // Owino SST
    [0, 5, 0], [0, 5, 1], // Ouma CRE (class teacher)
    [1, 6, 1], [1, 6, 3],
    [2, 7, 2], [2, 7, 3],
  ];

  for (const [ti, si, ci] of assignmentPlan) {
    await prisma.teacherAssignment.create({
      data: {
        teacherId: teachers[ti].id,
        subjectId: subjects[si].id,
        classroomId: classrooms[ci].id,
      },
    });
  }

  const users = [
    { username: "Admin", name: "John Doe", role: Role.ADMIN, teacherId: null },
    { username: "principal", name: "Mrs. Grace Otieno", role: Role.PRINCIPAL, teacherId: null },
    { username: "deputy", name: "Mr. Peter Okoth", role: Role.DEPUTY, teacherId: null },
    { username: "aouma", name: "Mrs. Alice Ouma", role: Role.CLASS_TEACHER, teacherId: teachers[0].id },
    { username: "jochieng", name: "Mr. John Ochieng", role: Role.SUBJECT_TEACHER, teacherId: teachers[1].id },
    { username: "smwangi", name: "Ms. Sarah Mwangi", role: Role.SUBJECT_TEACHER, teacherId: teachers[2].id },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        username: u.username,
        passwordHash: hash,
        name: u.name,
        role: u.role,
        teacherId: u.teacherId,
        active: true,
      },
    });
  }

  // ~12 students per class = 48
  const students = [];
  let adm = 1;
  for (let c = 0; c < classrooms.length; c++) {
    for (let i = 0; i < 12; i++) {
      const female = (c + i) % 2 === 0;
      const first = female
        ? pick(FIRST_NAMES_F, adm + i)
        : pick(FIRST_NAMES_M, adm + i);
      const last = pick(LAST_NAMES, adm * 3 + i);
      const student = await prisma.student.create({
        data: {
          admissionNo: `ALA${String(2026).slice(2)}${String(adm).padStart(3, "0")}`,
          upi: `UPI${String(100000 + adm)}`,
          firstName: first,
          lastName: last,
          gender: female ? Gender.FEMALE : Gender.MALE,
          dateOfBirth: new Date(2012 + (c < 2 ? 1 : 0), (i % 12), 5 + (i % 20)),
          parentName: `Parent of ${first}`,
          parentPhone: `+2547${String(10000000 + adm * 111).slice(0, 8)}`,
          kcpeOrKpseaNo: `KPSEA${2024}${String(adm).padStart(4, "0")}`,
          house: ["Lion", "Elephant", "Eagle", "Buffalo"][i % 4],
          medicalNotes: i % 7 === 0 ? "Mild asthma — keep inhaler available" : null,
          classroomId: classrooms[c].id,
        },
      });
      students.push(student);
      adm++;
    }
  }

  const adminUser = await prisma.user.findUnique({ where: { username: "Admin" } });

  // Past exams (2025 T3 end term) + current open exam (2026 T2 end term)
  const pastExam = await prisma.examination.create({
    data: {
      name: "End Term Examination — Term 3 2025",
      examType: ExamTypeCode.END_TERM,
      academicYearId: year2025.id,
      termId: terms2025[2].id,
      maxScore: 100,
      status: ExamStatus.LOCKED,
      deadline: new Date("2025-11-20"),
    },
  });

  const midExam = await prisma.examination.create({
    data: {
      name: "Midterm Examination — Term 2 2026",
      examType: ExamTypeCode.MIDTERM,
      academicYearId: year2026.id,
      termId: terms2026[1].id,
      maxScore: 100,
      status: ExamStatus.LOCKED,
      deadline: new Date("2026-06-15"),
    },
  });

  const openExam = await prisma.examination.create({
    data: {
      name: "End Term Examination — Term 2 2026",
      examType: ExamTypeCode.END_TERM,
      academicYearId: year2026.id,
      termId: terms2026[1].id,
      maxScore: 100,
      status: ExamStatus.OPEN,
      deadline: new Date("2026-07-30"),
    },
  });

  const catExam = await prisma.examination.create({
    data: {
      name: "CAT 1 — Term 2 2026",
      examType: ExamTypeCode.CAT,
      academicYearId: year2026.id,
      termId: terms2026[1].id,
      maxScore: 100,
      status: ExamStatus.LOCKED,
      deadline: new Date("2026-05-10"),
    },
  });

  async function seedMarks(
    examId: string,
    leaveGaps: boolean,
    submitted: boolean
  ) {
    let n = 0;
    for (const student of students) {
      for (let s = 0; s < subjects.length; s++) {
        n++;
        // Leave ~8% missing on open exam for alerts
        if (leaveGaps && n % 12 === 0) continue;
        await prisma.mark.create({
          data: {
            examinationId: examId,
            studentId: student.id,
            subjectId: subjects[s].id,
            score: scoreFor(n + student.admissionNo.charCodeAt(5) + s * 3),
            enteredById: adminUser?.id,
            submitted,
            submittedAt: submitted ? new Date() : null,
          },
        });
      }
    }
  }

  await seedMarks(pastExam.id, false, true);
  await seedMarks(midExam.id, false, true);
  await seedMarks(catExam.id, false, true);
  await seedMarks(openExam.id, true, false);

  // Set current year/term on settings
  const settings = await prisma.schoolSetting.findFirst();
  if (settings) {
    await prisma.schoolSetting.update({
      where: { id: settings.id },
      data: {
        currentYearId: year2026.id,
        currentTermId: terms2026[1].id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: adminUser?.id,
      action: "SEED",
      entity: "Database",
      details: "Initial ALara SMIS seed completed",
    },
  });

  console.log("Seed complete.");
  console.log("Logins (password Admin123): Admin, principal, deputy, aouma, jochieng, smwangi");
  console.log(`Students: ${students.length}, Subjects: ${subjects.length}, Open exam: ${openExam.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
