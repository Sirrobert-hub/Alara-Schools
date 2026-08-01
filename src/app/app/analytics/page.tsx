import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { gradeFromScore } from "@/lib/grading";

async function getAnalyticsData() {
  const [marks, classes, subjects] = await Promise.all([
    prisma.mark.findMany({ include: { examination: true, subject: true, student: { include: { classroom: true } } } }),
    prisma.classRoom.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  const schoolData = [] as Array<{ name: string; average: number }>;
  const classData = [] as Array<{ name: string; average: number }>;
  const subjectData = [] as Array<{ name: string; value: number }>;

  const classMap = new Map<string, number[]>();
  const subjectMap = new Map<string, number[]>();
  const examMap = new Map<string, number[]>();

  marks.forEach((mark) => {
    if (typeof mark.score !== "number") return;
    const className = mark.student.classroom.name;
    classMap.set(className, [...(classMap.get(className) ?? []), mark.score]);
    subjectMap.set(mark.subject.name, [...(subjectMap.get(mark.subject.name) ?? []), mark.score]);
    examMap.set(mark.examination.name, [...(examMap.get(mark.examination.name) ?? []), mark.score]);
  });

  for (const [name, scores] of classMap) {
    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    classData.push({ name, average: Math.round(average) });
  }

  for (const [name, scores] of subjectMap) {
    subjectData.push({ name, value: scores.length });
  }

  for (const [name, scores] of examMap) {
    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    schoolData.push({ name, average: Math.round(average) });
  }

  if (!schoolData.length) {
    schoolData.push({ name: "No data", average: 0 });
  }
  if (!classData.length) {
    classes.forEach((room) => classData.push({ name: room.name, average: 0 }));
  }
  if (!subjectData.length) {
    subjects.forEach((subject) => subjectData.push({ name: subject.name, value: 0 }));
  }

  return { schoolData, classData, subjectData };
}

export default async function AnalyticsPage() {
  const { schoolData, classData, subjectData } = await getAnalyticsData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">See school, class, and subject performance trends based on real exam data.</p>
      </div>

      <AnalyticsCharts schoolData={schoolData} classData={classData} subjectData={subjectData} />
    </div>
  );
}
