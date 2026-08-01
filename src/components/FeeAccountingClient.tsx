"use client";

import { useState } from "react";
import { recordFeePayment } from "@/app/actions";

interface LearnerLedger {
  id: string;
  admissionNo: string;
  name: string;
  className: string;
  feeBilled: number;
  feePaid: number;
  balance: number;
}

interface FeeAccountingClientProps {
  ledgers: LearnerLedger[];
  students: Array<{ id: string; name: string; admissionNo: string; balance: number }>;
}

export function FeeAccountingClient({ ledgers, students }: FeeAccountingClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("M-Pesa");
  const [refCode, setRefCode] = useState(`MPX${Math.floor(100000 + Math.random() * 899999)}`);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const totalBilled = ledgers.reduce((a, b) => a + b.feeBilled, 0);
  const totalPaid = ledgers.reduce((a, b) => a + b.feePaid, 0);
  const totalBal = totalBilled - totalPaid;

  const handleOpenPay = (stId?: string) => {
    if (stId) setSelectedStudentId(stId);
    setRefCode(`MPX${Math.floor(100000 + Math.random() * 899999)}`);
    setShowModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || !selectedStudentId) return;

    setSaving(true);
    setMsg(null);
    try {
      const res = await recordFeePayment({
        studentId: selectedStudentId,
        amount: amt,
        paymentMethod: method,
        referenceCode: refCode,
      });
      if (res.ok) {
        setMsg(`Payment of KES ${amt.toLocaleString()} recorded successfully!`);
        setTimeout(() => {
          setShowModal(false);
          setAmount("");
          setMsg(null);
        }, 1200);
      }
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Error posting payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card border-l-4 border-blue-600">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Term Fees Billed</div>
          <div className="text-2xl font-black text-slate-900 mt-1">KES {totalBilled.toLocaleString()}</div>
        </div>
        <div className="card border-l-4 border-emerald-600">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue Collected</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">KES {totalPaid.toLocaleString()}</div>
        </div>
        <div className="card border-l-4 border-rose-600">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Outstanding Balances</div>
          <div className="text-2xl font-black text-rose-600 mt-1">KES {totalBal.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Learner Fee Ledgers</h2>
            <p className="text-xs text-slate-500">Track fee balances and post direct receipts.</p>
          </div>
          <button onClick={() => handleOpenPay()} className="btn-primary text-xs">
            💳 Record Fee Payment
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Adm No</th>
                <th>Learner Name</th>
                <th>Class</th>
                <th>Total Billed</th>
                <th>Total Paid</th>
                <th>Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((l) => (
                <tr key={l.id}>
                  <td className="font-mono text-xs font-bold text-blue-700">{l.admissionNo}</td>
                  <td className="font-medium text-slate-900">{l.name}</td>
                  <td>{l.className}</td>
                  <td>KES {l.feeBilled.toLocaleString()}</td>
                  <td className="text-emerald-600 font-bold">KES {l.feePaid.toLocaleString()}</td>
                  <td className={l.balance > 0 ? "text-rose-600 font-bold" : "text-slate-400"}>
                    KES {l.balance.toLocaleString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenPay(l.id)}
                      className="btn-outline text-xs py-1 px-3"
                    >
                      + Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Record Fee Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="label">Select Learner</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="input text-xs"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo}) — Bal KES {s.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount Paid (KES)</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="input text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="input text-xs">
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Deposit">Bank Deposit</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="label">Transaction / Reference Code</label>
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  className="input text-xs font-mono"
                  required
                />
              </div>

              {msg && <div className="rounded-lg bg-blue-50 p-2.5 text-xs font-bold text-blue-800">{msg}</div>}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? "Posting..." : "✓ Post Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
