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
  students: "👤",
  teachers: "👥",
  exams: "📝",
  marks: "☰",
  reports: "📄",
  transcripts: "📋",
  analytics: "📊",
  users: "🔐",
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
      <div className="mb-8 px-2">
        <Link href="/app" className="font-display text-xl font-bold text-primary-dark">
          ALara<span className="text-primary-light">SMIS</span>
        </Link>
        <p className="mt-1 text-xs text-slate-500">Suna East, Migori</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
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
              className={cn("nav-item", active && "nav-item-active")}
            >
              <span className="w-5 text-center text-sm">{icons[item.icon]}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="mb-3 px-2">
          <div className="text-sm font-semibold text-slate-800">
            {data?.user?.name}
          </div>
          <div className="text-xs text-slate-500">
            {role ? ROLE_LABELS[role] : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-100"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className="font-display font-bold text-primary">ALara SMIS</span>
        <span className="text-xs text-slate-500">{role}</span>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
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
