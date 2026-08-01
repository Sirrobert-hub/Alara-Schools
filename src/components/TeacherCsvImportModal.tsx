"use client";

import { useState } from "react";
import { bulkImportTeachers } from "@/app/actions";

interface TeacherCsvImportModalProps {
  onClose: () => void;
}

interface ParsedTeacher {
  tscNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: "MALE" | "FEMALE";
}

export function TeacherCsvImportModal({ onClose }: TeacherCsvImportModalProps) {
  const [parsed, setParsed] = useState<ParsedTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleDownloadSample = () => {
    const sample =
      "TSCNumber,FirstName,LastName,Email,Phone,Gender\n" +
      "TSC/778899,Sarah,Wambui,wambui@alaraschools.ac.ke,+254712345678,FEMALE\n" +
      "TSC/665544,Peter,Omondi,omondi@alaraschools.ac.ke,+254723456789,MALE\n";
    const blob = new Blob([sample], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ALara_Teachers_Import_Template.csv";
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

      const items: ParsedTeacher[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols.length >= 3) {
          const tsc = cols[0] || `TSC/${Math.floor(100000 + Math.random() * 900000)}`;
          const first = cols[1] || "Teacher";
          const last = cols[2] || "Staff";
          const email = cols[3] || `${first.toLowerCase()}@alaraschools.ac.ke`;
          const phone = cols[4] || "+254700000000";
          const gender = cols[5]?.toUpperCase() === "MALE" ? "MALE" : "FEMALE";

          items.push({
            tscNumber: tsc,
            firstName: first,
            lastName: last,
            email,
            phone,
            gender,
          });
        }
      }
      setParsed(items);
      setStatus(`Parsed ${items.length} staff record(s) from CSV.`);
    };
    reader.readAsText(file);
  };

  const handleCommit = async () => {
    if (!parsed.length) return;
    setLoading(true);
    try {
      const res = await bulkImportTeachers(parsed);
      if (res.ok) {
        setStatus(`Successfully imported ${res.count} educators!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Failed to import staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">👩‍🏫 Bulk Import Staff via CSV</h3>
            <p className="text-xs text-slate-500">Upload CSV file with TSC staff details for roster enrollment.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div className="flex gap-3 mb-4">
          <button type="button" onClick={handleDownloadSample} className="btn-outline text-xs">
            ⬇️ Download Sample CSV
          </button>
        </div>

        <div className="mb-4 rounded-xl border-2 border-dashed border-purple-300 p-6 text-center bg-purple-50 hover:border-purple-600 cursor-pointer"
             onClick={() => document.getElementById("teacherCsvInput")?.click()}>
          <div className="text-3xl mb-1">📁</div>
          <p className="text-sm font-semibold text-slate-700">Click to select Teachers CSV File</p>
          <p className="text-xs text-slate-400 mt-1">Headers: TSCNumber, FirstName, LastName, Email, Phone, Gender</p>
          <input id="teacherCsvInput" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </div>

        {status && <div className="mb-4 rounded-lg bg-purple-50 p-3 text-xs font-semibold text-purple-800">{status}</div>}

        {parsed.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2">TSC Number</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsed.slice(0, 10).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-mono">{p.tscNumber}</td>
                    <td className="p-2 font-medium">{p.firstName} {p.lastName}</td>
                    <td className="p-2">{p.email}</td>
                    <td className="p-2">{p.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
