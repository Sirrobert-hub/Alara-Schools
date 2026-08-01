import { prisma } from "@/lib/prisma";
import { NoticeboardClient } from "@/components/NoticeboardClient";

export default async function NoticeBoardPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { date: "desc" },
    include: { author: { select: { name: true, role: true } } },
    take: 50,
  });

  const notices = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    content: a.content,
    date: a.date.toISOString(),
    authorName: a.author?.name ?? "System",
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          Noticeboard &amp; Announcements
        </h1>
        <p className="mt-2 text-slate-600">
          School-wide announcements, academic notices, events, and SMS broadcast management.
        </p>
      </div>

      <NoticeboardClient notices={notices} />
    </div>
  );
}
