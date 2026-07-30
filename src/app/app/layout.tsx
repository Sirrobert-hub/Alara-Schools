import { AppSidebar } from "@/components/AppSidebar";
import { requireAuth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return (
    <div className="min-h-screen bg-slate-100">
      <AppSidebar />
      <main className="min-h-screen pt-14 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
