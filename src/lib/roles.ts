import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "System Administrator",
  PRINCIPAL: "Principal",
  DEPUTY: "Deputy Headteacher",
  CLASS_TEACHER: "Class Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
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
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/students",
    label: "Students",
    icon: "students",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER"],
  },
  {
    href: "/app/teachers",
    label: "Teachers",
    icon: "teachers",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY"],
  },
  {
    href: "/app/examinations",
    label: "Examinations",
    icon: "exams",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/marks",
    label: "Marks Entry",
    icon: "marks",
    roles: ["ADMIN", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/reports",
    label: "Report Cards",
    icon: "reports",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER"],
  },
  {
    href: "/app/transcripts",
    label: "Transcripts",
    icon: "transcripts",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER"],
  },
  {
    href: "/app/analytics",
    label: "Analytics",
    icon: "analytics",
    roles: ["ADMIN", "PRINCIPAL", "DEPUTY", "CLASS_TEACHER", "SUBJECT_TEACHER"],
  },
  {
    href: "/app/users",
    label: "Users",
    icon: "users",
    roles: ["ADMIN"],
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: "settings",
    roles: ["ADMIN"],
  },
];

export function canAccess(role: Role, href: string): boolean {
  const item = NAV_ITEMS.find((n) => n.href === href);
  if (!item) return true;
  return item.roles.includes(role);
}
