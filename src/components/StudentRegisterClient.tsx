"use client";

import { useState } from "react";
import Link from "next/link";
import { LearnerCsvImportModal } from "./LearnerCsvImportModal";

interface StudentItem {
  id: string;
  admissionNo: string;
  upi: string | null;
  firstName: string;
  lastName: string;
  gender: string;
  classroomId: string;
  classroomName: string;
  parentName: string | null;
  parentPhone: string | null;
  totalBilled: number;
  totalPaid: number;
  meanScore: number | null;
  meanGrade: string | null;
}

interface StudentRegisterClientProps {
  students: StudentItem[];
  classrooms: Array<{ id: string; name: string }>;
}

export function StudentRegisterClient({ students, classrooms }: StudentRegisterClientProps) {
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      (s.upi && s.upi.toLowerCase().includes(q));
    const matchClass = selectedClass ? s.classroomId === selectedClass : true;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search name, UPI, Admission..."
              className="input text-xs w-full sm:w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input text-xs w-full sm:w-48"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowCsvModal(true)}
              className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
            >
              📄 Import CSV
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Learners Register</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {filtered.length} of {students.length} Learners
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Adm No</th>
                <th>UPI Number</th>
                <th>Learner Name</th>
                <th>Grade/Class</th>
                <th>Gender</th>
                <th>Mean Score</th>
                <th>Fee Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">
                    No learner records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const bal = s.totalBilled - s.totalPaid;
                  return (
                    <tr key={s.id}>
                      <td className="font-mono text-xs font-bold text-blue-700">{s.admissionNo}</td>
                      <td className="font-mono text-xs text-slate-500">{s.upi || "—"}</td>
                      <td>
                        <Link href={`/app/students/${s.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                          {s.firstName} {s.lastName}
                        </Link>
                      </td>
                      <td>{s.classroomName}</td>
                      <td>{s.gender}</td>
                      <td className="font-bold">
                        {s.meanScore !== null ? (
                          <div className="flex items-center gap-2">
                            <span>{s.meanScore.toFixed(1)}</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 border border-blue-200">
                              {s.meanGrade}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {bal <= 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">
                            Cleared
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-extrabold text-rose-800">
                            Bal: KES {bal.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td>
                        <Link href={`/app/students/${s.id}`} className="text-blue-600 text-xs font-semibold hover:underline">
                          Profile →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCsvModal && (
        <LearnerCsvImportModal classrooms={classrooms} onClose={() => setShowCsvModal(false)} />
      )}
    </div>
  );
}
