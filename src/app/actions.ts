"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { ExamStatus, Role, AttendanceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

async function audit(userId: string, action: string, entity?: string, entityId?: string, details?: string) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, details },
  });
}

export async function saveMarks(
  examinationId: string,
  subjectId: string,
  rows: { studentId: string; score: number | null }[],
  submit = false
) {
  const session = await requireAuth();
  const role = session.user.role;

  const exam = await prisma.examination.findUnique({ where: { id: examinationId } });
  if (!exam) throw new Error("Examination not found");
  if (exam.status === ExamStatus.LOCKED) throw new Error("Examination is locked");

  if (role === Role.SUBJECT_TEACHER || role === Role.CLASS_TEACHER) {
    if (!session.user.teacherId) throw new Error("No teacher profile linked");
    const allowed = await prisma.teacherAssignment.findFirst({
      where: {
        teacherId: session.user.teacherId,
        subjectId,
      },
    });
    if (!allowed && role === Role.SUBJECT_TEACHER) {
      throw new Error("You are not assigned to this subject");
    }
  }

  for (const row of rows) {
    if (row.score !== null && (row.score < 0 || row.score > exam.maxScore)) {
      throw new Error(`Score must be between 0 and ${exam.maxScore}`);
    }
    await prisma.mark.upsert({
      where: {
        examinationId_studentId_subjectId: {
          examinationId,
          studentId: row.studentId,
          subjectId,
        },
      },
      create: {
        examinationId,
        studentId: row.studentId,
        subjectId,
        score: row.score,
        enteredById: session.user.id,
        submitted: submit,
        submittedAt: submit ? new Date() : null,
      },
      update: {
        score: row.score,
        enteredById: session.user.id,
        submitted: submit ? true : undefined,
        submittedAt: submit ? new Date() : undefined,
      },
    });
  }

  if (submit) {
    await audit(session.user.id, "SUBMIT_MARKS", "Examination", examinationId, `Subject ${subjectId}`);
  } else {
    await audit(session.user.id, "SAVE_MARKS", "Examination", examinationId, `Subject ${subjectId}`);
  }

  revalidatePath("/app/marks");
  revalidatePath("/app/analytics");
  revalidatePath("/app/reports");
  return { ok: true };
}

export async function setExamStatus(examinationId: string, status: ExamStatus) {
  const session = await requireRole(Role.ADMIN, Role.DEPUTY);
  await prisma.examination.update({
    where: { id: examinationId },
    data: { status },
  });
  await audit(session.user.id, "EXAM_STATUS", "Examination", examinationId, status);
  revalidatePath("/app/examinations");
  revalidatePath("/app/marks");
  return { ok: true };
}

export async function createExamination(data: {
  name: string;
  examType: string;
  academicYearId: string;
  termId: string;
  classroomId?: string;
  deadline?: string;
  maxScore?: number;
}) {
  const session = await requireRole(Role.ADMIN, Role.DEPUTY);
  const exam = await prisma.examination.create({
    data: {
      name: data.name,
      examType: data.examType as never,
      academicYearId: data.academicYearId,
      termId: data.termId,
      classroomId: data.classroomId || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      maxScore: data.maxScore ?? 100,
      status: ExamStatus.OPEN,
    },
  });
  await audit(session.user.id, "CREATE_EXAM", "Examination", exam.id, exam.name);
  revalidatePath("/app/examinations");
  return { ok: true, id: exam.id };
}

export async function upsertStudent(form: {
  id?: string;
  admissionNo: string;
  upi?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "MALE" | "FEMALE";
  classroomId: string;
  parentName?: string;
  parentPhone?: string;
  house?: string;
  kcpeOrKpseaNo?: string;
  medicalNotes?: string;
  dateOfBirth?: string;
}) {
  const session = await requireRole(Role.ADMIN, Role.CLASS_TEACHER, Role.DEPUTY);
  const data = {
    admissionNo: form.admissionNo,
    upi: form.upi || null,
    firstName: form.firstName,
    lastName: form.lastName,
    middleName: form.middleName || null,
    gender: form.gender,
    classroomId: form.classroomId,
    parentName: form.parentName || null,
    parentPhone: form.parentPhone || null,
    house: form.house || null,
    kcpeOrKpseaNo: form.kcpeOrKpseaNo || null,
    medicalNotes: form.medicalNotes || null,
    dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
  };

  if (form.id) {
    await prisma.student.update({ where: { id: form.id }, data });
    await audit(session.user.id, "UPDATE_STUDENT", "Student", form.id);
  } else {
    const s = await prisma.student.create({ data });
    await audit(session.user.id, "CREATE_STUDENT", "Student", s.id);
  }
  revalidatePath("/app/students");
  return { ok: true };
}

export async function promoteStudent(studentId: string) {
  const session = await requireRole(Role.ADMIN, Role.CLASS_TEACHER, Role.DEPUTY);
  await prisma.student.update({
    where: { id: studentId },
    data: { promoted: true },
  });
  await audit(session.user.id, "PROMOTE_STUDENT", "Student", studentId);
  revalidatePath(`/app/students/${studentId}`);
  return { ok: true };
}

export async function createUser(form: {
  username: string;
  name: string;
  role: Role;
  teacherId?: string;
}) {
  const session = await requireRole(Role.ADMIN);
  const passwordHash = await bcrypt.hash("Admin123", 10);
  const user = await prisma.user.create({
    data: {
      username: form.username,
      name: form.name,
      role: form.role,
      passwordHash,
      teacherId: form.teacherId || null,
      active: true,
    },
  });
  await audit(session.user.id, "CREATE_USER", "User", user.id, form.username);
  revalidatePath("/app/users");
  return { ok: true };
}

export async function resetUserPassword(userId: string) {
  const session = await requireRole(Role.ADMIN);
  const passwordHash = await bcrypt.hash("Admin123", 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await audit(session.user.id, "RESET_PASSWORD", "User", userId);
  revalidatePath("/app/users");
  return { ok: true };
}

export async function toggleUserActive(userId: string) {
  const session = await requireRole(Role.ADMIN);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  await prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });
  await audit(session.user.id, "TOGGLE_USER", "User", userId);
  revalidatePath("/app/users");
  return { ok: true };
}

export async function updateSettings(form: {
  name: string;
  county: string;
  subCounty: string;
  country: string;
  phone?: string;
  email?: string;
  address?: string;
  currentYearId?: string;
  currentTermId?: string;
  mission?: string;
  vision?: string;
  coreValues?: string;
}) {
  const session = await requireRole(Role.ADMIN);
  const existing = await prisma.schoolSetting.findFirst();
  if (!existing) throw new Error("Settings missing");
  await prisma.schoolSetting.update({
    where: { id: existing.id },
    data: form,
  });
  await audit(session.user.id, "UPDATE_SETTINGS", "SchoolSetting", existing.id);
  revalidatePath("/app/settings");
  return { ok: true };
}

export async function saveComment(form: {
  examinationId: string;
  studentId: string;
  type: "SUBJECT_TEACHER" | "CLASS_TEACHER" | "PRINCIPAL";
  content: string;
  subjectId?: string;
}) {
  const session = await requireAuth();
  const comment = await prisma.comment.create({
    data: {
      examinationId: form.examinationId,
      studentId: form.studentId,
      type: form.type,
      content: form.content,
      subjectId: form.subjectId || null,
      authorId: session.user.id,
    },
  });
  revalidatePath("/app/reports");
  return { ok: true, id: comment.id };
}

export async function markAttendance(
  classroomId: string,
  termId: string,
  date: string,
  rows: { studentId: string; status: AttendanceStatus; remarks?: string }[]
) {
  const session = await requireAuth();
  const role = session.user.role;

  if (role === Role.CLASS_TEACHER) {
    if (!session.user.teacherId) throw new Error("No teacher profile linked");
    const classroom = await prisma.classRoom.findUnique({ where: { id: classroomId } });
    if (!classroom || classroom.classTeacherId !== session.user.teacherId) {
      throw new Error("You are not the class teacher for this classroom");
    }
  } else if (role !== Role.ADMIN && role !== Role.DEPUTY) {
    throw new Error("You are not permitted to record attendance");
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) throw new Error("Invalid date");

  for (const row of rows) {
    await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: row.studentId,
          date: parsedDate,
        },
      },
      update: {
        status: row.status,
        remarks: row.remarks || null,
        classroomId,
        termId,
        recordedById: session.user.id,
      },
      create: {
        studentId: row.studentId,
        classroomId,
        termId,
        date: parsedDate,
        status: row.status,
        remarks: row.remarks || null,
        recordedById: session.user.id,
      },
    });
  }

  await audit(session.user.id, "MARK_ATTENDANCE", "ClassRoom", classroomId, `${rows.length} students, ${date}`);
  revalidatePath("/app/attendance");
  return { ok: true };
}

/** Present-day count / rate for a student, used on the student profile page. */
export async function getStudentAttendanceSummary(studentId: string) {
  const records = await prisma.attendance.findMany({ where: { studentId } });
  const total = records.length;
  const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
  const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : null;
  return { total, present, rate };
}

export async function recordFeePayment(data: {
  studentId: string;
  amount: number;
  paymentMethod: string;
  referenceCode: string;
}) {
  const session = await requireRole(Role.ADMIN, Role.PRINCIPAL);
  const payment = await prisma.feePayment.create({
    data: {
      studentId: data.studentId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceCode: data.referenceCode,
      recordedById: session.user.id,
    },
  });
  await audit(session.user.id, "FEE_PAYMENT", "Student", data.studentId, `KES ${data.amount} via ${data.paymentMethod}`);
  revalidatePath("/app/fees");
  revalidatePath("/app/students");
  return { ok: true, id: payment.id };
}

export async function createAnnouncement(data: {
  title: string;
  category: string;
  content: string;
}) {
  const session = await requireRole(Role.ADMIN, Role.PRINCIPAL, Role.DEPUTY);
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      category: data.category,
      content: data.content,
      authorId: session.user.id,
    },
  });
  await audit(session.user.id, "CREATE_ANNOUNCEMENT", "Announcement", announcement.id, data.title);
  revalidatePath("/app/noticeboard");
  revalidatePath("/app");
  return { ok: true, id: announcement.id };
}

export async function bulkImportStudents(
  list: Array<{
    admissionNo: string;
    upi?: string;
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    classroomId: string;
    parentName?: string;
    parentPhone?: string;
  }>
) {
  const session = await requireRole(Role.ADMIN, Role.PRINCIPAL, Role.DEPUTY);
  let count = 0;
  for (const item of list) {
    await prisma.student.upsert({
      where: { admissionNo: item.admissionNo },
      update: {
        upi: item.upi || null,
        firstName: item.firstName,
        lastName: item.lastName,
        gender: item.gender,
        classroomId: item.classroomId,
        parentName: item.parentName || null,
        parentPhone: item.parentPhone || null,
      },
      create: {
        admissionNo: item.admissionNo,
        upi: item.upi || null,
        firstName: item.firstName,
        lastName: item.lastName,
        gender: item.gender,
        classroomId: item.classroomId,
        parentName: item.parentName || null,
        parentPhone: item.parentPhone || null,
      },
    });
    count++;
  }
  await audit(session.user.id, "BULK_IMPORT_STUDENTS", "Student", undefined, `Imported ${count} students`);
  revalidatePath("/app/students");
  revalidatePath("/app");
  return { ok: true, count };
}

export async function bulkImportTeachers(
  list: Array<{
    tscNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    gender: "MALE" | "FEMALE";
  }>
) {
  const session = await requireRole(Role.ADMIN, Role.PRINCIPAL);
  let count = 0;
  for (const item of list) {
    await prisma.teacher.upsert({
      where: { tscNumber: item.tscNumber },
      update: {
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email || null,
        phone: item.phone || null,
        gender: item.gender,
      },
      create: {
        tscNumber: item.tscNumber,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email || null,
        phone: item.phone || null,
        gender: item.gender,
      },
    });
    count++;
  }
  await audit(session.user.id, "BULK_IMPORT_TEACHERS", "Teacher", undefined, `Imported ${count} teachers`);
  revalidatePath("/app/teachers");
  revalidatePath("/app");
  return { ok: true, count };
}

