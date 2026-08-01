"use client";

import { useState } from "react";
import { TeacherCsvImportModal } from "./TeacherCsvImportModal";

interface TeacherItem {
  id: string;
  tscNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string | null;
  phone: string | null;
  assignedClasses: string[];
}

interface TeacherRegisterClientProps {
  teachers: TeacherItem[];
}

export function TeacherRegisterClient({ teachers }: TeacherRegisterClientProps) {
  const [showCsvModal, setShowCsvModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Educators & Staff Roster</h2>
          <p className="text-xs text-slate-500">{teachers.length} registered teaching staff members.</p>
        </div>
        <button
          onClick={() => setShowCsvModal(true)}
          className="rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition"
        >
          📄 Import Staff CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div key={t.id} className="card hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                {t.firstName[0]}
                {t.lastName[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {t.gender === "FEMALE" ? "Mrs./Ms." : "Mr."} {t.firstName} {t.lastName}
                </h4>
                <div className="text-xs text-slate-400 font-mono">{t.tscNumber}</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <div>
                <strong className="text-slate-700">Email:</strong> {t.email || "n/a"}
              </div>
              <div>
                <strong className="text-slate-700">Phone:</strong> {t.phone || "n/a"}
              </div>
              <div>
                <strong className="text-slate-700">Classes Assigned:</strong>{" "}
                {t.assignedClasses.length ? t.assignedClasses.join(", ") : "Unassigned"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCsvModal && <TeacherCsvImportModal onClose={() => setShowCsvModal(false)} />}
    </div>
  );
}
