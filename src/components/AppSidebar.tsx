"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/roles";
import { Role } from "@prisma/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const icons: Record<string, string> = {
  dashboard: "▦",
  students: "🎓",
  teachers: "👨‍🏫",
  exams: "📝",
  marks: "✍️",
  fees: "💳",
  attendance: "✓",
  reports: "📄",
  transcripts: "🏆",
  analytics: "📊",
  noticeboard: "📢",
  users: "🔐",
  audit: "📜",
  settings: "⚙",
};

export function AppSidebar() {
  const { data } = useSession();
  const pathname = usePathname();
  const role = data?.user?.role as Role | undefined;
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter((n) => role && n.roles.includes(role));

  const Nav = (
    <>
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center font-black text-white text-lg shadow-sm">
          A
        </div>
        <div>
          <Link href="/app" className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            ALara<span className="text-blue-600">SMIS</span>
          </Link>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">PP1 – Grade 9 CBC</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {items.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                active
                  ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span className="w-5 text-center text-sm">{icons[item.icon] || "•"}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-3 px-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {data?.user?.name ? data.user.name.split(" ").map((n) => n[0]).join("").substring(0, 2) : "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold text-slate-800 truncate">
              {data?.user?.name || "User"}
            </div>
            <div className="text-[10px] font-semibold text-blue-600 truncate">
              {role ? ROLE_LABELS[role] : ""}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-100 text-slate-700"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className="font-display font-extrabold text-blue-700">ALara SMIS</span>
        <span className="text-xs font-semibold text-slate-500">{role ? ROLE_LABELS[role] : ""}</span>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {Nav}
      </aside>
    </>
  );
}
