import { ExamStatus } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "@/components/DashboardCharts";
import { formatDate } from "@/lib/utils";

async function getDashboardData() {
  const [studentCount, teacherCount, classCount, openExamCount, openExam] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.classRoom.count(),
    prisma.examination.count({ where: { status: ExamStatus.OPEN } }),
    prisma.examination.findFirst({
      where: { status: ExamStatus.OPEN },
      include: { marks: { include: { subject: true } }, classroom: { include: { classLevel: true, stream: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const classAverages = [] as Array<{ name: string; average: number }>;
  const subjectDistribution = [] as Array<{ name: string; value: number }>;
  const trend = [] as Array<{ name: string; average: number }>;

  if (openExam) {
    const classRooms = await prisma.classRoom.findMany({
      include: {
        classLevel: true,
        stream: true,
        students: {
          include: { marks: { where: { examinationId: openExam.id }, select: { score: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    classRooms.forEach((room) => {
      const scores = room.students.map((student) => student.marks[0]?.score).filter((score): score is number => typeof score === "number");
      if (scores.length) {
        classAverages.push({
          name: room.name,
          average: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
        });
      }
    });

    const subjectCounts: Record<string, number> = {};
    openExam.marks.forEach((mark) => {
      const subject = mark.subject.name;
      subjectCounts[subject] = (subjectCounts[subject] ?? 0) + 1;
    });
    for (const [name, value] of Object.entries(subjectCounts)) {
      subjectDistribution.push({ name, value });
    }
  }

  const recentExams = await prisma.examination.findMany({
    where: { status: { in: [ExamStatus.LOCKED, ExamStatus.OPEN] } },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { marks: { select: { score: true } } },
  });

  recentExams.reverse().forEach((exam) => {
    const scores = exam.marks.map((mark) => mark.score).filter((score): score is number => typeof score === "number");
    const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    trend.push({ name: exam.name, average });
  });

  return {
    studentCount,
    teacherCount,
    classCount,
    openExamCount,
    openExam,
    classAverages,
    subjectDistribution,
    trend,
  };
}

export default async function DashboardPage() {
  const { studentCount, teacherCount, classCount, openExamCount, openExam, classAverages, subjectDistribution, trend } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Students</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">{studentCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Teachers</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">{teacherCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Classrooms</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">{classCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Open exams</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">{openExamCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-3 text-slate-600">
            Use the sidebar to navigate school records, exams, marks entry, reports, and analytics. Open exams are the fastest way to enter scores for the current term.
          </p>
          {openExam && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current exam</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{openExam.name}</p>
              <p className="mt-1 text-sm text-slate-600">Deadline: {formatDate(openExam.deadline)}</p>
            </div>
          )}
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">Quick actions</h3>
          <div className="mt-6 space-y-4">
            <Link href="/app/marks" className="btn-outline w-full justify-center">Enter marks</Link>
            <Link href="/app/examinations" className="btn-outline w-full justify-center">Manage exams</Link>
            <Link href="/app/reports" className="btn-outline w-full justify-center">Generate reports</Link>
          </div>
        </div>
      </div>

      <DashboardCharts classAverages={classAverages} subjectDistribution={subjectDistribution} trend={trend} />
    </div>
  );
}
