// ═══════════════════════════════════════════════════════════════
//  Updates Page — Home feed with announcements + events
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Calendar, PushPin, MapPin, Clock, SignOut, User, CaretDown } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { UserTag } from "../types";

const TAG_BADGE_COLOR: Record<UserTag, string> = {
  [UserTag.FACULTY]: "from-rose-500/80 to-pink-500/80",
  [UserTag.PRESIDENT]: "from-red-500/80 to-red-500/80",
  [UserTag.COORDINATOR]: "from-amber-500/80 to-orange-500/80",
  [UserTag.CLUB_MEMBER]: "from-orange-500/80 to-cyan-500/80",
  [UserTag.STUDENT]: "from-emerald-500/80 to-teal-500/80",
};

const TAG_LABEL: Record<UserTag, string> = {
  [UserTag.FACULTY]: "Faculty",
  [UserTag.PRESIDENT]: "President",
  [UserTag.COORDINATOR]: "Coordinator",
  [UserTag.CLUB_MEMBER]: "Club Member",
  [UserTag.STUDENT]: "Student",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as any } },
};

export default function UpdatesPage() {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [eventsData, setEventsData] = useState<any[]>([]);

  // Fetch announcements & events with polling
  useEffect(() => {
    const token = localStorage.getItem("htc_token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [annRes, evtRes] = await Promise.all([
          fetch("http://localhost:4000/api/announcements", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:4000/api/events", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [annData, evtData] = await Promise.all([annRes.json(), evtRes.json()]);

        if (annData.success) setAnnouncements(annData.announcements);
        if (evtData.success) setEventsData(evtData.events);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchData(); // Initial
    const iv = setInterval(fetchData, 8000); // 8-second polling
    return () => clearInterval(iv);
  }, []);

  // Derive the student's academic year from their email
  // Email format: 2025kucp1025@iiitkota.ac.in → admission year 2025
  // Current year 2026 → 2025 = 1st year, 2024 = 2nd year, etc.
  const userYear = useMemo(() => {
    if (!user?.email) return null;
    const match = user.email.match(/^(\d{4})/);
    if (!match) return null;
    const admissionYear = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();
    const year = currentYear - admissionYear + 1;
    return year >= 1 && year <= 4 ? year : null;
  }, [user]);

  // Filter announcements:
  //  • Global (no club, no targetYear) → everyone sees it
  //  • Club-scoped → only club members + faculty/president
  //  • Year-scoped → only matching year students + faculty/president
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      // Faculty and President see ALL announcements
      if (user?.tag === UserTag.FACULTY || user?.tag === UserTag.PRESIDENT) return true;

      // Year-scoped announcement
      if (a.targetYear) {
        return userYear === a.targetYear;
      }

      // Club-scoped announcement
      if (a.clubId) {
        return (user?.clubIds ?? []).includes(a.clubId);
      }

      // Global announcement (no club, no year)
      return true;
    });
  }, [user, announcements, userYear]);

  const events = useMemo(() => {
    return eventsData.filter(
      (e) =>
        e.clubId === null ||
        user?.tag === UserTag.FACULTY ||
        user?.tag === UserTag.PRESIDENT ||
        (user?.clubIds ?? []).includes(e.clubId!)
    );
  }, [user, eventsData]);

  if (!user) return null;

  return (
    <div className="pb-28 pt-6 px-4 max-w-2xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-sm text-surface-200/50">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">{user.name.split(" ")[0]} 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${TAG_BADGE_COLOR[user.tag]} text-white`}>
              {TAG_LABEL[user.tag]}
            </span>
          </div>
          <button
            onClick={logout}
            className="
              w-10 h-10 rounded-xl glass
              flex items-center justify-center
              text-surface-200/50 hover:text-red-400
              transition-colors cursor-pointer
            "
            title="Sign out"
          >
            <SignOut size={16} />
          </button>
        </div>
      </motion.header>

      {/* ── Announcements ───────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Megaphone size={16} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Announcements</h2>
          <span className="text-xs text-surface-200/30 bg-surface-900/60 px-2 py-0.5 rounded-full">
            {filteredAnnouncements.length}
          </span>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {filteredAnnouncements.length === 0 && (
            <p className="text-sm text-surface-200/50 italic py-4">No announcements yet.</p>
          )}
          {filteredAnnouncements.map((a) => {
            const isExpanded = expandedAnnouncementId === a.id;
            return (
              <motion.div
                key={a.id}
                variants={fadeUp}
                onClick={() => setExpandedAnnouncementId(isExpanded ? null : a.id)}
                className="glass rounded-2xl p-5 hover:border-orange-500/20 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {a.pinned && (
                      <PushPin size={13} className="text-amber-400 fill-amber-400" />
                    )}
                    <h3 className="font-semibold text-white text-[15px] group-hover:text-orange-300 transition-colors">
                      {a.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.clubName && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-900/60 text-surface-200/50 whitespace-nowrap">
                        {a.clubName}
                      </span>
                    )}
                    {a.targetYear && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-orange-500 border border-red-500/15 whitespace-nowrap font-medium">
                        🎓 {a.targetYear === 1 ? "1st" : a.targetYear === 2 ? "2nd" : a.targetYear === 3 ? "3rd" : "4th"} Year
                      </span>
                    )}
                    <CaretDown
                      size={14}
                      className={`text-surface-200/30 transition-transform duration-200 ${isExpanded ? "rotate-180 text-orange-400" : ""}`}
                    />
                  </div>
                </div>
                <p className={`text-sm text-surface-200/50 leading-relaxed mb-3 ${isExpanded ? "" : "line-clamp-2"}`}>
                  {a.body}
                </p>
                <div className="flex items-center gap-3 text-xs text-surface-200/30">
                  <div className="flex items-center gap-1">
                    <User size={11} />
                    <span>{a.authorName}</span>
                  </div>
                  <span>·</span>
                  <span>{timeAgo(a.createdAt)}</span>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-surface-200/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-surface-200/50">
                          <Clock size={11} />
                          <span>Posted on {formatDate(a.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-surface-200/50">
                          <User size={11} />
                          <span>By {a.authorName}</span>
                        </div>
                        {a.clubName && (
                          <div className="flex items-center gap-2 text-xs text-surface-200/50">
                            <Megaphone size={11} />
                            <span>Scoped to {a.clubName}</span>
                          </div>
                        )}
                        {a.targetYear && (
                          <div className="flex items-center gap-2 text-xs text-orange-500">
                            <Megaphone size={11} />
                            <span>🎓 Targeted to {a.targetYear === 1 ? "1st" : a.targetYear === 2 ? "2nd" : a.targetYear === 3 ? "3rd" : "4th"} year students</span>
                          </div>
                        )}
                        {!a.clubName && !a.targetYear && (
                          <div className="flex items-center gap-2 text-xs text-surface-200/50">
                            <Megaphone size={11} />
                            <span>🌐 Global announcement — visible to all</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Upcoming Events ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Calendar size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
          <span className="text-xs text-surface-200/30 bg-surface-900/60 px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {events.map((e) => {
            const d = new Date(e.date);
            const day = d.getDate();
            const month = d.toLocaleString("en", { month: "short" });
            const isExpanded = expandedEventId === e.id;
            return (
              <motion.div
                key={e.id}
                variants={fadeUp}
                onClick={() => setExpandedEventId(isExpanded ? null : e.id)}
                className="glass rounded-2xl p-5 hover:border-emerald-500/20 transition-colors group cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-emerald-400 leading-none">{day}</span>
                    <span className="text-[10px] uppercase text-emerald-400/60 font-semibold">{month}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white text-[15px] group-hover:text-emerald-300 transition-colors truncate">
                        {e.title}
                      </h3>
                      <CaretDown
                        size={14}
                        className={`text-surface-200/30 transition-transform duration-200 flex-shrink-0 ml-2 ${isExpanded ? "rotate-180 text-emerald-400" : ""}`}
                      />
                    </div>
                    <p className={`text-sm text-surface-200/50 mb-2 ${isExpanded ? "" : "line-clamp-1"}`}>
                      {e.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-surface-200/30">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>
                          {e.startTime}
                          {e.endTime ? ` – ${e.endTime}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={11} />
                        <span>{e.location}</span>
                      </div>
                      {e.clubName && (
                        <>
                          <span>·</span>
                          <span>{e.clubName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-surface-200/10 flex flex-col gap-3">
                        {/* Full description */}
                        {e.description && (
                          <div>
                            <p className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider mb-1">Description</p>
                            <p className="text-sm text-surface-200/50 leading-relaxed">{e.description}</p>
                          </div>
                        )}
                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-surface-900/30 rounded-xl p-3 border border-surface-200/5">
                            <p className="text-[10px] uppercase tracking-wider text-surface-200/50 mb-1">Date</p>
                            <p className="text-sm text-white font-medium">
                              {new Date(e.date).toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          <div className="bg-surface-900/30 rounded-xl p-3 border border-surface-200/5">
                            <p className="text-[10px] uppercase tracking-wider text-surface-200/50 mb-1">Time</p>
                            <p className="text-sm text-white font-medium">
                              {e.startTime}{e.endTime ? ` – ${e.endTime}` : ""}
                            </p>
                          </div>
                          <div className="bg-surface-900/30 rounded-xl p-3 border border-surface-200/5">
                            <p className="text-[10px] uppercase tracking-wider text-surface-200/50 mb-1">Location</p>
                            <p className="text-sm text-white font-medium">{e.location}</p>
                          </div>
                          {e.clubName && (
                            <div className="bg-surface-900/30 rounded-xl p-3 border border-surface-200/5">
                              <p className="text-[10px] uppercase tracking-wider text-surface-200/50 mb-1">Organized By</p>
                              <p className="text-sm text-white font-medium">{e.clubName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}
