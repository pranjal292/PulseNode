// ═══════════════════════════════════════════════════════════════
//  Clubs Page — Browse all clubs
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as any } },
};

// Map aesthetics dynamically 
const CLUB_AESTHETICS: Record<string, { emoji: string, color: string }> = {
  "Cypher": { emoji: "🔐", color: "#818cf8" },
  "Codebase": { emoji: "💻", color: "#34d399" },
  "Odyssey": { emoji: "📖", color: "#f472b6" },
  "Neon Cinematics": { emoji: "🎬", color: "#fb923c" },
  "GDG": { emoji: "🚀", color: "#a78bfa" },
};

const getAesthetic = (name: string) => {
  return CLUB_AESTHETICS[name] || { emoji: "🌟", color: "#94a3b8" };
};

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [expandedClubId, setExpandedClubId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("htc_token");
    if (!token) return;
    fetch("http://localhost:4000/api/clubs", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setClubs(data.clubs);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="pb-28 pt-6 px-4 max-w-2xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Clubs</h1>
        <p className="text-sm text-surface-200/40 mt-1">
          Explore campus organizations
        </p>
      </motion.header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        {clubs.map((club) => {
          const isMember = (user?.clubIds ?? []).includes(club.id);
          const aesthetic = getAesthetic(club.name);
          const isExpanded = expandedClubId === club.id;
          return (
            <motion.div
              key={club.id}
              variants={fadeUp}
              whileHover={{ scale: 1.01, y: -2 }}
              onClick={() => setExpandedClubId(isExpanded ? null : club.id)}
              className="glass rounded-2xl p-5 hover:border-indigo-500/15 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-start gap-4">
                {/* Emoji Logo */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${aesthetic.color}20, ${aesthetic.color}08)`,
                    border: `1px solid ${aesthetic.color}25`,
                  }}
                >
                  {aesthetic.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-[15px] group-hover:text-indigo-300 transition-colors">
                      {club.name}
                    </h3>
                    {isMember && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                        Joined
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-200/50 line-clamp-2 mb-3">
                    {club.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-surface-200/30">
                      <Users size={12} />
                      <span>{club.memberCount} members</span>
                    </div>
                    <ArrowRight
                      size={16}
                      className={`text-surface-200/20 transition-all ${isExpanded ? "rotate-90 text-indigo-400" : "group-hover:text-indigo-400 group-hover:translate-x-1"}`}
                    />
                  </div>
                </div>
              </div>

              {/* Members Expanded Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-surface-200/10">
                      <h4 className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider mb-3">
                        Roster
                      </h4>
                      {club.memberships && club.memberships.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {club.memberships.map((m: any) => (
                            <div key={m.id} className="flex items-center justify-between bg-surface-900/30 p-2.5 rounded-xl border border-surface-200/5">
                              <div className="flex flex-col min-w-0 pr-4">
                                <span className="text-sm font-semibold text-white truncate">{m.name}</span>
                                <span className="text-xs text-surface-200/40 truncate">{m.email}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200/10 text-surface-200/60 font-medium">
                                {m.tag.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-surface-200/40 italic">No members currently registered.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
