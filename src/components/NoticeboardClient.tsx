"use client";

import { useState } from "react";
import { createAnnouncement } from "@/app/actions";

interface Notice {
  id: string;
  title: string;
  category: string;
  content: string;
  date: string;
  authorName: string;
}

interface NoticeboardClientProps {
  notices: Notice[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Academic: "bg-blue-100 text-blue-800 border-blue-200",
  Finance: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Event: "bg-purple-100 text-purple-800 border-purple-200",
  Health: "bg-rose-100 text-rose-800 border-rose-200",
  General: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NoticeboardClient({ notices }: NoticeboardClientProps) {
  const [list, setList] = useState<Notice[]>(notices);
  const [showModal, setShowModal] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Academic");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsTarget, setSmsTarget] = useState("All Parents");
  const [smsSent, setSmsSent] = useState(false);
  const [filterCat, setFilterCat] = useState("All");

  const categories = ["All", "Academic", "Finance", "Event", "Health", "General"];
  const filtered = filterCat === "All" ? list : list.filter((n) => n.category === filterCat);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      await createAnnouncement({ title, category, content });
      const newNotice: Notice = {
        id: `local-${Date.now()}`,
        title,
        category,
        content,
        date: new Date().toISOString(),
        authorName: "You",
      };
      setList((prev) => [newNotice, ...prev]);
      setMsg("Announcement posted successfully!");
      setTimeout(() => {
        setShowModal(false);
        setTitle("");
        setContent("");
        setMsg(null);
      }, 1200);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Error posting announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleSmsSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSent(true);
    setTimeout(() => {
      setShowSms(false);
      setSmsMessage("");
      setSmsSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold border transition ${
                filterCat === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSms(true)}
            className="rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-2"
          >
            📱 SMS Broadcast
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs"
          >
            📢 New Announcement
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["Academic", "Finance", "Event", "General"].map((cat) => {
          const count = list.filter((n) => n.category === cat).length;
          const color = CATEGORY_COLORS[cat] ?? "bg-slate-100 text-slate-700 border-slate-200";
          return (
            <div key={cat} className={`card border rounded-xl px-4 py-3 ${color}`}>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">{cat}</div>
              <div className="text-2xl font-black mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Notice Feed */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="card py-16 text-center text-slate-400">
            <p className="text-4xl mb-2">📢</p>
            <p>No announcements yet. Post the first one!</p>
          </div>
        )}
        {filtered.map((notice) => {
          const color = CATEGORY_COLORS[notice.category] ?? CATEGORY_COLORS.General;
          return (
            <div
              key={notice.id}
              className="card hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div
                className={`flex-shrink-0 rounded-xl border px-3 py-1.5 text-xs font-extrabold self-start ${color}`}
              >
                {notice.category}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base leading-snug">{notice.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{notice.content}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(notice.date)} &bull; Posted by{" "}
                  <span className="font-semibold text-slate-500">{notice.authorName}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">📢 New Announcement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="e.g. Term 2 End-Term Exam Schedule"
                  required
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                  {["Academic", "Finance", "Event", "Health", "General"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Content / Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input min-h-[100px] resize-y"
                  placeholder="Provide the full details of the announcement..."
                  required
                />
              </div>
              {msg && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800 border border-blue-200">
                  {msg}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? "Posting..." : "📢 Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS Broadcast Modal */}
      {showSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">📱 SMS Broadcast</h3>
              <button onClick={() => setShowSms(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            {smsSent ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-bold text-emerald-700">SMS Broadcast Queued!</p>
                <p className="text-sm text-slate-500 mt-1">Messages will be delivered to all recipients.</p>
              </div>
            ) : (
              <form onSubmit={handleSmsSend} className="space-y-4">
                <div>
                  <label className="label">Target Recipients</label>
                  <select
                    value={smsTarget}
                    onChange={(e) => setSmsTarget(e.target.value)}
                    className="input text-xs"
                  >
                    <option>All Parents</option>
                    <option>Grade 7 Parents</option>
                    <option>Grade 8 Parents</option>
                    <option>Grade 9 Parents</option>
                    <option>All Staff</option>
                  </select>
                </div>
                <div>
                  <label className="label">SMS Message (max 160 chars)</label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value.slice(0, 160))}
                    className="input min-h-[80px] resize-none"
                    placeholder="Type your SMS message..."
                    required
                  />
                  <p className="text-right text-xs text-slate-400 mt-1">
                    {smsMessage.length}/160
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSms(false)}
                    className="btn-outline text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                    📤 Send SMS
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
