"use client";

import { useState } from "react";
import { bulkImportStudents } from "@/app/actions";

interface LearnerCsvImportModalProps {
  classrooms: Array<{ id: string; name: string }>;
  onClose: () => void;
}

interface ParsedStudent {
  admissionNo: string;
  upi?: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  classroomId: string;
  parentName?: string;
  parentPhone?: string;
}

export function LearnerCsvImportModal({ classrooms, onClose }: LearnerCsvImportModalProps) {
  const [parsed, setParsed] = useState<ParsedStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleDownloadSample = () => {
    const sample =
      "AdmissionNo,UPI,FirstName,LastName,Gender,ClassroomName,ParentName,ParentPhone\n" +
      "ALA26901,UPI20269901,Mary,Moraa,FEMALE,Grade 7A,Mr. Moraa,+254712345678\n" +
      "ALA26902,UPI20269902,David,Omondi,MALE,Grade 7B,Mrs. Omondi,+254723456789\n";
    const blob = new Blob([sample], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ALara_Learners_Import_Template.csv";
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/);
      if (lines.length < 2) return;

      const items: ParsedStudent[] = [];
      const defaultRoomId = classrooms[0]?.id || "";

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols.length >= 3) {
          const adm = cols[0] || `ALA26${Math.floor(100 + Math.random() * 900)}`;
          const upi = cols[1] || `UPI2026${Math.floor(1000 + Math.random() * 9000)}`;
          const first = cols[2] || "Learner";
          const last = cols[3] || "Student";
          const gender = cols[4]?.toUpperCase() === "MALE" ? "MALE" : "FEMALE";
          const roomName = cols[5] || "";
          const matchedRoom = classrooms.find((r) => r.name.toLowerCase() === roomName.toLowerCase());
          const classroomId = matchedRoom ? matchedRoom.id : defaultRoomId;

          items.push({
            admissionNo: adm,
            upi,
            firstName: first,
            lastName: last,
            gender,
            classroomId,
            parentName: cols[6] || `Parent of ${first}`,
            parentPhone: cols[7] || "+254700000000",
          });
        }
      }
      setParsed(items);
      setStatus(`Parsed ${items.length} learner record(s) from CSV.`);
    };
    reader.readAsText(file);
  };

  const handleCommit = async () => {
    if (!parsed.length) return;
    setLoading(true);
    try {
      const res = await bulkImportStudents(parsed);
      if (res.ok) {
        setStatus(`Successfully imported ${res.count} learners!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Failed to import learners");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">📄 Bulk Import Learners via CSV</h3>
            <p className="text-xs text-slate-500">Upload CSV file with learner details for batch enrollment.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div className="flex gap-3 mb-4">
          <button type="button" onClick={handleDownloadSample} className="btn-outline text-xs">
            ⬇️ Download Sample CSV
          </button>
        </div>

        <div className="mb-4 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center bg-slate-50 hover:border-blue-500 cursor-pointer"
             onClick={() => document.getElementById("learnerCsvInput")?.click()}>
          <div className="text-3xl mb-1">📁</div>
          <p className="text-sm font-semibold text-slate-700">Click to select CSV File</p>
          <p className="text-xs text-slate-400 mt-1">Headers: AdmissionNo, UPI, FirstName, LastName, Gender, ClassroomName, ParentName, ParentPhone</p>
          <input id="learnerCsvInput" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </div>

        {status && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800">{status}</div>}

        {parsed.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2">Adm No</th>
                  <th className="p-2">UPI</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Gender</th>
                  <th className="p-2">Parent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsed.slice(0, 10).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-mono">{p.admissionNo}</td>
                    <td className="p-2 font-mono">{p.upi}</td>
                    <td className="p-2 font-medium">{p.firstName} {p.lastName}</td>
                    <td className="p-2">{p.gender}</td>
                    <td className="p-2">{p.parentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 10 && <p className="p-2 text-center text-[11px] text-slate-400">...and {parsed.length - 10} more records</p>}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-outline text-xs">Cancel</button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={!parsed.length || loading}
            className="btn-primary text-xs"
          >
            {loading ? "Importing..." : `Commit Import (${parsed.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
