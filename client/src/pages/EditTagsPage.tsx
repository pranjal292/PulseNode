// ═══════════════════════════════════════════════════════════════
//  Edit Tags Page — Change a user's role tag
//  Visible to: PRESIDENT, COORDINATOR
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserGear, CaretDown, CheckCircle, ShieldWarning } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { UserTag, type User } from "../types";

const TAG_OPTIONS = [
  { value: UserTag.STUDENT, label: "Student", color: "text-emerald-400" },
  { value: UserTag.CLUB_MEMBER, label: "Club Member", color: "text-orange-400" },
  { value: UserTag.COORDINATOR, label: "Coordinator", color: "text-amber-400" },
  { value: UserTag.PRESIDENT, label: "President", color: "text-orange-500" },
  { value: UserTag.FACULTY, label: "Faculty", color: "text-rose-400" },
];

const TAG_RANK: Record<UserTag, number> = {
  [UserTag.STUDENT]: 0,
  [UserTag.CLUB_MEMBER]: 1,
  [UserTag.COORDINATOR]: 2,
  [UserTag.PRESIDENT]: 3,
  [UserTag.FACULTY]: 4,
};

export default function EditTagsPage() {
  const { user, fetchAllUsers, updateUserTag } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [allClubs, setAllClubs] = useState<{id: string; name: string}[]>([]);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAll = () => {
      fetchAllUsers().then(setAllUsers);
      const token = localStorage.getItem("pulsenode_token");
      fetch("http://localhost:4000/api/clubs", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setAllClubs(data.clubs);
        })
        .catch(() => {});
    };

    fetchAll();
    const iv = setInterval(fetchAll, 10000);
    return () => clearInterval(iv);
  }, [fetchAllUsers]);
  const [newTag, setNewTag] = useState<UserTag | "">("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const adminRank = TAG_RANK[user.tag];

  // Only show users ranked below the current user
  const editableUsers = allUsers.filter(
    (u) => u.id !== user.id && TAG_RANK[u.tag] < adminRank
  );

  const selectedUser = allUsers.find((u) => u.id === selectedUserId);

  // Tags the admin can assign (strictly below their rank)
  const assignableTags = TAG_OPTIONS.filter(
    (t) => TAG_RANK[t.value] < adminRank
  );

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedUserId || !newTag) {
      setError("Select a user and a new tag");
      return;
    }

    if (selectedUser?.tag === newTag) {
      setError("User already has this tag");
      return;
    }

    const err = await updateUserTag(selectedUserId, newTag as UserTag, selectedClubIds);
    if (err) {
      setError(err);
      return;
    }

    setSuccess(`${selectedUser?.name}'s tag updated to ${newTag}`);
    setTimeout(() => {
      setSuccess(null);
      setSelectedUserId("");
      setNewTag("");
      setSelectedClubIds([]);
    }, 2500);
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-2xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <UserGear size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Tags</h1>
            <p className="text-sm text-surface-200/50">Update user roles</p>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-2xl p-6 flex flex-col gap-5"
      >
        {/* Info */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <ShieldWarning size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-400/80 leading-relaxed">
            You can only modify users ranked below you and assign tags below your own level.
            All changes are logged in the audit trail.
          </p>
        </div>

        {/* Select User */}
        <div>
          <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
            Select User
          </label>
          <div className="relative">
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setNewTag("");
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer appearance-none"
            >
              <option value="">Choose a user...</option>
              {editableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email} ({u.tag})
                </option>
              ))}
            </select>
            <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200/30 pointer-events-none" />
          </div>
        </div>

        {/* Selected user info */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-900/40 border border-surface-200/8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center text-white font-semibold text-sm">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedUser.name}</p>
                  <p className="text-xs text-surface-200/50">
                    Current tag:{" "}
                    <span className={TAG_OPTIONS.find((t) => t.value === selectedUser.tag)?.color}>
                      {selectedUser.tag}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Tag */}
        {selectedUser && (
          <div>
            <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
              New Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {assignableTags.map((t) => {
                const isSelected = newTag === t.value;
                const isCurrent = selectedUser.tag === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setNewTag(t.value)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium
                      border transition-all cursor-pointer
                      ${isCurrent
                        ? "opacity-30 cursor-not-allowed border-surface-200/10 text-surface-200/50"
                        : isSelected
                          ? `bg-surface-900/60 border-amber-500/40 ${t.color}`
                          : "bg-surface-900/30 border-surface-200/10 text-surface-200/50 hover:border-amber-500/20"
                      }
                    `}
                  >
                    {t.label}
                    {isCurrent && " (current)"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Club Membership Checklist */}
        <AnimatePresence>
          {newTag === UserTag.CLUB_MEMBER && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-3">
                <label className="block text-xs font-medium text-surface-200/50 uppercase tracking-wider">
                  Assign to Clubs (Required)
                </label>
                <div className="flex flex-col gap-2">
                  {allClubs.length === 0 ? (
                    <p className="text-sm text-surface-200/50 italic">No clubs are currently registered in the database.</p>
                  ) : (
                    allClubs.map(club => (
                      <label key={club.id} className="flex items-center gap-3 text-sm text-surface-200/80 p-3 rounded-xl bg-surface-900/30 border border-surface-200/10 cursor-pointer hover:border-amber-500/30 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={selectedClubIds.includes(club.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClubIds([...selectedClubIds, club.id]);
                            } else {
                              setSelectedClubIds(selectedClubIds.filter(id => id !== club.id));
                            }
                          }}
                          className="w-4 h-4 accent-amber-500 rounded border-surface-200/20 bg-surface-900/50 cursor-pointer"
                        />
                        {club.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold text-sm"
            >
              <CheckCircle size={18} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        {selectedUser && newTag && !success && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="
              w-full py-3.5 rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-600
              hover:from-amber-400 hover:to-orange-500
              text-white font-semibold text-sm
              shadow-[0_4px_24px_rgba(251,146,60,0.3)]
              hover:shadow-[0_8px_32px_rgba(251,146,60,0.45)]
              transition-all duration-300
              flex items-center justify-center gap-2
              cursor-pointer
            "
          >
            <UserGear size={16} />
            Update Tag
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
