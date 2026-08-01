import { prisma } from "@/lib/prisma";
import { FeeAccountingClient } from "@/components/FeeAccountingClient";

export default async function FeesPage() {
  const dbStudents = await prisma.student.findMany({
    orderBy: [{ classroom: { classLevel: { orderIndex: "asc" } } }, { lastName: "asc" }, { firstName: "asc" }],
    include: {
      classroom: { include: { classLevel: true } },
      feePayments: { select: { amount: true } },
    },
  });

  const ledgers = dbStudents.map((s) => {
    const feeBilled = s.classroom.classLevel.feePerTerm || 15000;
    const feePaid = s.feePayments.reduce((acc, p) => acc + p.amount, 0);
    const balance = Math.max(0, feeBilled - feePaid);

    return {
      id: s.id,
      admissionNo: s.admissionNo,
      name: `${s.firstName} ${s.lastName}`,
      className: s.classroom.name,
      feeBilled,
      feePaid,
      balance,
    };
  });

  const students = dbStudents.map((s) => {
    const feeBilled = s.classroom.classLevel.feePerTerm || 15000;
    const feePaid = s.feePayments.reduce((acc, p) => acc + p.amount, 0);
    return {
      id: s.id,
      admissionNo: s.admissionNo,
      name: `${s.firstName} ${s.lastName}`,
      balance: Math.max(0, feeBilled - feePaid),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Fee Accounting & Receipts</h1>
        <p className="mt-2 text-slate-600">Grade-level fee structures, learner ledgers, and revenue collection.</p>
      </div>

      <FeeAccountingClient ledgers={ledgers} students={students} />
    </div>
  );
}
