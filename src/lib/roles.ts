import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "System Administrator",
  PRINCIPAL: "Principal",
  DEPUTY: "Deputy Headteacher",
  CLASS_TEACHER: "Class Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
  PARENT: "Parent / Guardian",
};

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    icon: "dashboard",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER", "PARENT"],
  },
  {
    href: "/app/students",
    label: "Learners Register",
    icon: "students",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER"],
  },
  {
    href: "/app/teachers",
    label: "Teaching Staff",
    icon: "teachers",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY"],
  },
  {
    href: "/app/examinations",
    label: "Exam Sessions",
    icon: "exams",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/marks",
    label: "Marks Grid",
    icon: "marks",
    roles: ["ADMIN", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/fees",
    label: "Fee Accounting",
    icon: "fees",
    roles: ["ADMIN", "PRINCIPAL", "PARENT"],
  },
  {
    href: "/app/attendance",
    label: "Daily Attendance",
    icon: "attendance",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "PARENT"],
  },
  {
    href: "/app/reports",
    label: "Report Cards",
    icon: "reports",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "PARENT"],
  },
  {
    href: "/app/transcripts",
    label: "Transcripts",
    icon: "transcripts",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "PARENT"],
  },
  {
    href: "/app/analytics",
    label: "Visual Analytics",
    icon: "analytics",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/noticeboard",
    label: "Noticeboard & SMS",
    icon: "noticeboard",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER", "PARENT"],
  },
  {
    href: "/app/users",
    label: "User Accounts",
    icon: "users",
    roles: ["ADMIN"],
  },
  {
    href: "/app/audit",
    label: "Security Audit Logs",
    icon: "audit",
    roles: ["ADMIN", "PRINCIPAL"],
  },
  {
    href: "/app/settings",
    label: "System Settings",
    icon: "settings",
    roles: ["ADMIN"],
  },
];

export function canAccess(role: Role, href: string): boolean {
  const item = NAV_ITEMS.find((n) => n.href === href);
  if (!item) return true;
  return item.roles.includes(role);
}
