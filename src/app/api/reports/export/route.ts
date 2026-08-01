import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { gradeFromScore } from "@/lib/grading";

/**
 * GET /api/reports/export?examId=...&classroomId=...
 * Streams a CSV of every student's per-subject scores + CBC band for the
 * selected exam (optionally filtered to one classroom). Opens directly in
 * Excel/Sheets. Any authenticated user can export (marks entry already
 * enforces who can see which students).
 */
function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const examId = request.nextUrl.searchParams.get("examId");
  const classroomId = request.nextUrl.searchParams.get("classroomId");
  if (!examId) {
    return NextResponse.json({ error: "examId is required" }, { status: 400 });
  }

  const exam = await prisma.examination.findUnique({ where: { id: examId } });
  if (!exam) {
    return NextResponse.json({ error: "Examination not found" }, { status: 404 });
  }

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

  const subjectSet = new Map<string, string>();
  for (const student of students) {
    for (const mark of student.marks) {
      subjectSet.set(mark.subject.id, mark.subject.name);
    }
  }
  const subjects = Array.from(subjectSet.entries()).sort((a, b) => a[1].localeCompare(b[1]));

  const header = [
    "Admission No",
    "Name",
    "Classroom",
    ...subjects.flatMap(([, name]) => [`${name} Score`, `${name} Band`]),
    "Average",
  ];

  const rows = students.map((student) => {
    const scoreBySubject = new Map(student.marks.map((m) => [m.subjectId, m.score]));
    const cells: (string | number | null)[] = [
      student.admissionNo,
      `${student.firstName} ${student.lastName}`,
      student.classroom?.name ?? "",
    ];
    const numericScores: number[] = [];
    for (const [subjectId] of subjects) {
      const score = scoreBySubject.get(subjectId) ?? null;
      if (score !== null && score !== undefined) numericScores.push(score);
      cells.push(score ?? "");
      cells.push(score !== null && score !== undefined ? gradeFromScore(score)?.band ?? "" : "");
    }
    const average = numericScores.length
      ? Math.round((numericScores.reduce((a, b) => a + b, 0) / numericScores.length) * 10) / 10
      : "";
    cells.push(average);
    return cells;
  });

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  const filename = `${exam.name.replace(/[^a-z0-9]+/gi, "-")}-results.csv`;

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EXPORT_CSV",
      entity: "Examination",
      entityId: exam.id,
      details: `Exported ${students.length} student rows${classroomId ? ` for classroom ${classroomId}` : ""}.`,
    },
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
