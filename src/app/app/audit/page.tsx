import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";

function formatDate(date: Date) {
  return date.toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_COLORS: Record<string, string> = {
  SYSTEM_INIT: "bg-purple-100 text-purple-800 border-purple-200",
  SEED_DATA: "bg-slate-100 text-slate-700 border-slate-200",
  CREATE_EXAM: "bg-blue-100 text-blue-800 border-blue-200",
  EXAM_STATUS: "bg-amber-100 text-amber-800 border-amber-200",
  SAVE_MARKS: "bg-cyan-100 text-cyan-800 border-cyan-200",
  SUBMIT_MARKS: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CREATE_STUDENT: "bg-teal-100 text-teal-800 border-teal-200",
  UPDATE_STUDENT: "bg-sky-100 text-sky-800 border-sky-200",
  PROMOTE_STUDENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  BULK_IMPORT_STUDENTS: "bg-violet-100 text-violet-800 border-violet-200",
  BULK_IMPORT_TEACHERS: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  CREATE_USER: "bg-blue-100 text-blue-800 border-blue-200",
  RESET_PASSWORD: "bg-red-100 text-red-800 border-red-200",
  TOGGLE_USER: "bg-orange-100 text-orange-800 border-orange-200",
  UPDATE_SETTINGS: "bg-gray-100 text-gray-800 border-gray-200",
  FEE_PAYMENT: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CREATE_ANNOUNCEMENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  MARK_ATTENDANCE: "bg-pink-100 text-pink-800 border-pink-200",
};

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: {
        select: { name: true, username: true, role: true },
      },
    },
  });

  const entityCounts: Record<string, number> = {};
  const actionCounts: Record<string, number> = {};
  logs.forEach((l) => {
    entityCounts[l.entity ?? "System"] = (entityCounts[l.entity ?? "System"] ?? 0) + 1;
    actionCounts[l.action] = (actionCounts[l.action] ?? 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          Security &amp; Audit Logs
        </h1>
        <p className="mt-2 text-slate-600">
          Complete chronological trail of all system actions, user operations, and data changes.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card border-l-4 border-blue-600">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Events</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{logs.length}</div>
        </div>
        <div className="card border-l-4 border-emerald-600">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Action Types</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{Object.keys(actionCounts).length}</div>
        </div>
        <div className="card border-l-4 border-violet-600">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Entities Affected</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{Object.keys(entityCounts).length}</div>
        </div>
        <div className="card border-l-4 border-amber-600">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Most Recent</div>
          <div className="text-xs font-bold text-slate-700 mt-2 leading-snug">
            {logs[0]
              ? new Date(logs[0].createdAt).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              : "—"}
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      <div className="card">
        <h2 className="font-bold text-slate-900 mb-4">Action Distribution</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(actionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([action, count]) => {
              const color = ACTION_COLORS[action] ?? "bg-slate-100 text-slate-700 border-slate-200";
              return (
                <span
                  key={action}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${color}`}
                >
                  {action}
                  <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-xs font-black">
                    {count}
                  </span>
                </span>
              );
            })}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <h2 className="font-bold text-slate-900 mb-4">Recent Audit Events ({logs.length})</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-40">Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const color = ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-700 border-slate-200";
                return (
                  <tr key={log.id}>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800 text-xs">
                        {log.user?.name ?? "System"}
                      </div>
                      {log.user?.username && (
                        <div className="text-xs text-slate-400">@{log.user.username}</div>
                      )}
                    </td>
                    <td>
                      {log.user?.role ? (
                        <span className="text-xs font-semibold text-blue-700">
                          {ROLE_LABELS[log.user.role]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${color}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{log.entity ?? "—"}</td>
                    <td className="max-w-xs truncate text-xs text-slate-500">
                      {log.details ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
