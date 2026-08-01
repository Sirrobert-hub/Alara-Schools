"use client";

import { useState } from "react";
import { saveMarks } from "@/app/actions";

interface StudentMarkRow {
  studentId: string;
  admissionNo: string;
  name: string;
  score: number | null;
  grade: string | null;
  remarks: string;
}

interface MarksGridClientProps {
  examId: string;
  subjectId: string;
  examName: string;
  subjectName: string;
  maxScore: number;
  isLocked: boolean;
  initialRows: StudentMarkRow[];
}

function calculateCBCGrade(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "—";
  if (score >= 90) return "EE1";
  if (score >= 75) return "EE2";
  if (score >= 58) return "ME1";
  if (score >= 41) return "ME2";
  if (score >= 31) return "AE1";
  if (score >= 21) return "AE2";
  if (score >= 11) return "BE1";
  return "BE2";
}

function getCBCRemarks(grade: string): string {
  if (grade.startsWith("EE")) return "Exceeds Expectations - Outstanding Mastery";
  if (grade.startsWith("ME")) return "Meets Expectations - Good Understanding";
  if (grade.startsWith("AE")) return "Approaching Expectations - Requires Practice";
  if (grade.startsWith("BE")) return "Below Expectations - Needs Targeted Support";
  return "";
}

function getGradeBadgeHTML(grade: string) {
  if (grade === "—" || !grade) return <span className="text-slate-400">—</span>;
  let bg = "bg-rose-100 text-rose-800 border-rose-200";
  if (grade.startsWith("EE")) bg = "bg-emerald-100 text-emerald-800 border-emerald-200";
  else if (grade.startsWith("ME")) bg = "bg-blue-100 text-blue-800 border-blue-200";
  else if (grade.startsWith("AE")) bg = "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${bg}`}>
      {grade}
    </span>
  );
}

export function MarksGridClient({
  examId,
  subjectId,
  examName,
  subjectName,
  maxScore,
  isLocked,
  initialRows,
}: MarksGridClientProps) {
  const [rows, setRows] = useState<StudentMarkRow[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleScoreChange = (studentId: string, value: string) => {
    const num = value === "" ? null : parseFloat(value);
    setRows((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const g = num !== null && !isNaN(num) ? calculateCBCGrade(num) : "—";
          const rem = g !== "—" ? getCBCRemarks(g) : "";
          return { ...r, score: num, grade: g, remarks: rem };
        }
        return r;
      })
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const handleSave = async (submit = false) => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = rows.map((r) => ({
        studentId: r.studentId,
        score: r.score,
      }));
      await saveMarks(examId, subjectId, payload, submit);
      setMessage(submit ? "Marks submitted successfully!" : "All marks saved successfully!");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Error saving marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Entering Marks: <span className="text-blue-600">{subjectName}</span> ({examName})
          </h2>
          <p className="text-xs text-slate-500">
            Keyboard Tab/Enter navigation recalculates KNEC 8-Point CBC grades in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLocked || saving}
            onClick={() => handleSave(false)}
            className="btn-primary text-xs"
          >
            {saving ? "Saving..." : "💾 Save All Marks"}
          </button>
          <button
            type="button"
            disabled={isLocked || saving}
            onClick={() => handleSave(true)}
            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            ✓ Submit Marks
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800 border border-blue-200">
          {message}
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Adm No</th>
              <th>Learner Name</th>
              <th className="w-36">Score (0-{maxScore})</th>
              <th className="w-32">KNEC Grade</th>
              <th>Performance Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.studentId}>
                <td className="font-bold text-slate-400">{idx + 1}</td>
                <td className="font-mono text-xs font-bold text-blue-700">{row.admissionNo}</td>
                <td className="font-medium text-slate-900">{row.name}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={maxScore}
                    disabled={isLocked}
                    value={row.score !== null ? row.score : ""}
                    onChange={(e) => handleScoreChange(row.studentId, e.target.value)}
                    className="input text-xs font-bold text-blue-700 py-1.5 w-28"
                  />
                </td>
                <td>{getGradeBadgeHTML(row.grade || "—")}</td>
                <td>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={row.remarks}
                    onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                    placeholder="Auto-generated remark..."
                    className="input text-xs py-1.5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
