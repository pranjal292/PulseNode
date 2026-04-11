import { API_URL } from "../config";
// ═══════════════════════════════════════════════════════════════
//  Announcement Page — Create new announcements
//  FACULTY  → scope by student year (derived from email)
//  PRESIDENT / COORDINATOR → scope by club
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, PaperPlaneRight, PushPin, CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { UserTag } from "../types";

const YEAR_OPTIONS = [
  { value: 0, label: "🌐 Global — All Students" },
  { value: 1, label: "📗 1st Year Students" },
  { value: 2, label: "📘 2nd Year Students" },
  { value: 3, label: "📙 3rd Year Students" },
  { value: 4, label: "📕 4th Year Students" },
];

export default function AnnouncementPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [clubId, setClubId] = useState("");
  const [targetYear, setTargetYear] = useState(0);  // 0 = global
  const [pinned, setPinned] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [scopeType, setScopeType] = useState<"global" | "club" | "year">("global");

  const isFaculty = user?.tag === UserTag.FACULTY;

  // Fetch clubs for scope dropdown
  useEffect(() => {
    const token = localStorage.getItem("pulsenode_token");
    if (!token) return;
    fetch(`${API_URL}/clubs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClubs(data.clubs);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setError("");

    const token = localStorage.getItem("pulsenode_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          clubId: scopeType === "club" ? (clubId || null) : null,
          pinned,
          targetYear: scopeType === "year" && targetYear > 0 ? targetYear : null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to post announcement");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setTitle("");
        setBody("");
        setClubId("");
        setTargetYear(0);
        setScopeType("global");
        setPinned(false);
        setSuccess(false);
      }, 2500);
    } catch {
      setError("Network error");
    }
  };

  if (!user) return null;

  return (
    <div className="pb-28 pt-6 px-4 max-w-2xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Megaphone size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Post Announcement</h1>
            <p className="text-sm text-surface-200/50">Broadcast to the community</p>
          </div>
        </div>
      </motion.header>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-strong rounded-2xl p-6 flex flex-col gap-5"
      >
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mid-Semester Exam Schedule Released"
            required
            className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm placeholder:text-surface-200/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement here..."
            required
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm placeholder:text-surface-200/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none"
          />
        </div>

        {/* Scope + Pin row */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-200/50 mb-2 uppercase tracking-wider">
              Scope
            </label>

            {/* Scope Type Toggle */}
            <div className="flex bg-surface-900/60 rounded-xl p-1 mb-3">
              {[
                { key: "global" as const, label: "🌐 Global", icon: null },
                { key: "year" as const, label: "🎓 Year-wise", icon: null },
                ...(!isFaculty ? [{ key: "club" as const, label: "🏫 Club", icon: null }] : []),
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { setScopeType(opt.key); setClubId(""); setTargetYear(0); }}
                  className={`
                    flex-1 py-2 rounded-lg text-xs font-semibold
                    transition-all duration-200 cursor-pointer
                    ${scopeType === opt.key
                      ? "bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white shadow-lg"
                      : "text-surface-200/50 hover:text-surface-200/80"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Year Dropdown */}
            {scopeType === "year" && (
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all cursor-pointer appearance-none"
              >
                <option value={0}>Select year...</option>
                {YEAR_OPTIONS.filter(o => o.value > 0).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Club Dropdown */}
            {scopeType === "club" && (
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all cursor-pointer appearance-none"
              >
                <option value="">Select club...</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {scopeType === "global" && (
              <p className="text-[11px] text-surface-200/30 italic">All students will see this announcement.</p>
            )}
            {scopeType === "year" && targetYear > 0 && (
              <p className="text-[11px] text-surface-200/30 mt-1.5 italic">
                Only {targetYear === 1 ? "1st" : targetYear === 2 ? "2nd" : targetYear === 3 ? "3rd" : "4th"} year students will see this.
              </p>
            )}
            {scopeType === "club" && clubId && (
              <p className="text-[11px] text-surface-200/30 mt-1.5 italic">
                Only members of this club will see this announcement.
              </p>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl
                border text-sm font-medium transition-all cursor-pointer
                ${
                  pinned
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-surface-900/50 border-surface-200/10 text-surface-200/50 hover:border-amber-500/20 hover:text-amber-400/60"
                }
              `}
            >
              <PushPin size={14} className={pinned ? "fill-amber-400" : ""} />
              Pin
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold text-sm"
            >
              <CheckCircle size={18} />
              Announcement posted successfully!
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="
                w-full py-3.5 rounded-xl
                btn-primary font-semibold text-sm
                shadow-[0_4px_24px_rgba(99,102,241,0.3)]
                hover:shadow-[0_8px_32px_rgba(99,102,241,0.45)]
                transition-all duration-300
                flex items-center justify-center gap-2
                cursor-pointer
              "
            >
              <PaperPlaneRight size={16} />
              Post Announcement
            </motion.button>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
