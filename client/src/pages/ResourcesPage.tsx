// ═══════════════════════════════════════════════════════════════
//  Resources Page — Club inventory & issuance with scheduling
//  Visible to: CLUB_MEMBER+
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Envelope, CheckCircle, Buildings, Warning, ShieldCheck, Clock, Calendar, Copy, X } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

// ═══════════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════════

interface Booking {
  borrower: string;
  from: string;   // ISO date-time
  to: string;     // ISO date-time
}

interface ClubInventoryItem {
  id: string;
  name: string;
  emoji: string;
  status: "AVAILABLE" | "CHECKED_OUT" | "RESERVED";
  quantity: number;
  bookings: Booking[];
}

// ═══════════════════════════════════════════════════════════════
//  Club-specific Inventory Catalog (with existing bookings)
// ═══════════════════════════════════════════════════════════════

const CLUB_INVENTORY: Record<string, ClubInventoryItem[]> = {
  Cypher: [
    { id: "cy-1", name: "Arduino Uno Kit",           emoji: "🔧", status: "AVAILABLE",    quantity: 5, bookings: [] },
    { id: "cy-2", name: "Raspberry Pi 4B",           emoji: "🍓", status: "AVAILABLE",    quantity: 3, bookings: [
      { borrower: "Arjun S.", from: "2026-04-15T10:00", to: "2026-04-15T18:00" }
    ]},
    { id: "cy-3", name: "Breadboard + Jumper Wires", emoji: "🔌", status: "AVAILABLE",    quantity: 10, bookings: [] },
    { id: "cy-4", name: "Multimeter (Digital)",       emoji: "📏", status: "AVAILABLE",    quantity: 4, bookings: [] },
    { id: "cy-5", name: "Soldering Iron Station",    emoji: "🔥", status: "CHECKED_OUT",  quantity: 2, bookings: [
      { borrower: "Rahul V.", from: "2026-04-10T09:00", to: "2026-04-12T17:00" }
    ]},
    { id: "cy-6", name: "ESP32 Dev Board",           emoji: "📡", status: "AVAILABLE",    quantity: 6, bookings: [] },
    { id: "cy-7", name: "Logic Analyzer",            emoji: "📊", status: "RESERVED",     quantity: 1, bookings: [
      { borrower: "Sneha G.", from: "2026-04-14T14:00", to: "2026-04-14T20:00" }
    ]},
  ],
  Codebase: [
    { id: "cb-1", name: "Mechanical Keyboard (Loaner)", emoji: "⌨️", status: "AVAILABLE",   quantity: 3, bookings: [] },
    { id: "cb-2", name: "USB Hub (7-port)",              emoji: "🔗", status: "AVAILABLE",   quantity: 5, bookings: [] },
    { id: "cb-3", name: "Laptop Stand",                  emoji: "💻", status: "AVAILABLE",   quantity: 4, bookings: [
      { borrower: "Priya P.", from: "2026-04-13T10:00", to: "2026-04-13T16:00" }
    ]},
    { id: "cb-4", name: "HDMI to USB-C Adapter",        emoji: "🔄", status: "CHECKED_OUT", quantity: 6, bookings: [
      { borrower: "Kiran M.", from: "2026-04-11T08:00", to: "2026-04-11T20:00" }
    ]},
    { id: "cb-5", name: "Presentation Clicker",          emoji: "🖱️", status: "AVAILABLE",  quantity: 3, bookings: [] },
    { id: "cb-6", name: "Whiteboard Markers Set",        emoji: "🖊️", status: "AVAILABLE",  quantity: 10, bookings: [] },
  ],
  Odyssey: [
    { id: "od-1", name: "Chess Board Set",           emoji: "♟️", status: "AVAILABLE",    quantity: 4, bookings: [] },
    { id: "od-2", name: "Board Games Collection",    emoji: "🎲", status: "AVAILABLE",    quantity: 6, bookings: [] },
    { id: "od-3", name: "Novel Library (Shelf)",     emoji: "📚", status: "AVAILABLE",    quantity: 1, bookings: [] },
    { id: "od-4", name: "Poetry Mic + Stand",        emoji: "🎤", status: "AVAILABLE",    quantity: 2, bookings: [] },
    { id: "od-5", name: "Debate Timer",              emoji: "⏱️", status: "CHECKED_OUT", quantity: 1, bookings: [
      { borrower: "Amit K.", from: "2026-04-10T09:00", to: "2026-04-11T18:00" }
    ]},
  ],
  "Neon Cinematics": [
    { id: "nc-1", name: "DSLR Camera (Club)",        emoji: "📷", status: "AVAILABLE",    quantity: 2, bookings: [
      { borrower: "Vikram R.", from: "2026-04-16T06:00", to: "2026-04-16T22:00" }
    ]},
    { id: "nc-2", name: "Ring Light (18-inch)",       emoji: "💡", status: "AVAILABLE",    quantity: 3, bookings: [] },
    { id: "nc-3", name: "Tripod (Heavy Duty)",       emoji: "📐", status: "AVAILABLE",    quantity: 3, bookings: [] },
    { id: "nc-4", name: "Shotgun Microphone",        emoji: "🎙️", status: "RESERVED",    quantity: 2, bookings: [
      { borrower: "Neon Team", from: "2026-04-15T10:00", to: "2026-04-15T20:00" }
    ]},
    { id: "nc-5", name: "Gimbal Stabilizer",         emoji: "🎬", status: "AVAILABLE",    quantity: 1, bookings: [] },
    { id: "nc-6", name: "SD Card (128GB)",           emoji: "💾", status: "AVAILABLE",    quantity: 8, bookings: [] },
    { id: "nc-7", name: "Green Screen Backdrop",     emoji: "🟩", status: "CHECKED_OUT",  quantity: 1, bookings: [
      { borrower: "Media Cell", from: "2026-04-10T08:00", to: "2026-04-13T20:00" }
    ]},
    { id: "nc-8", name: "Drone (DJI Mini 3)",        emoji: "🚁", status: "RESERVED",     quantity: 1, bookings: [
      { borrower: "Film Fest Crew", from: "2026-04-20T06:00", to: "2026-04-20T18:00" }
    ]},
  ],
  GDG: [
    { id: "gd-1", name: "Google Home Mini (Demo)",   emoji: "🔊", status: "AVAILABLE",    quantity: 2, bookings: [] },
    { id: "gd-2", name: "Android Dev Phone",         emoji: "📱", status: "AVAILABLE",    quantity: 3, bookings: [] },
    { id: "gd-3", name: "Firebase Swag Kit",         emoji: "🎁", status: "AVAILABLE",    quantity: 5, bookings: [] },
    { id: "gd-4", name: "USB-C Charging Station",    emoji: "🔋", status: "CHECKED_OUT",  quantity: 2, bookings: [
      { borrower: "DevFest Team", from: "2026-04-12T09:00", to: "2026-04-12T21:00" }
    ]},
    { id: "gd-5", name: "Sticker Collection (500pc)", emoji: "🏷️", status: "AVAILABLE",  quantity: 3, bookings: [] },
  ],
};

const STATUS_CONFIG = {
  AVAILABLE:   { label: "Available",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CHECKED_OUT: { label: "Checked Out", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  RESERVED:    { label: "Reserved",    color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
};

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function hasConflict(bookings: Booking[], from: string, to: string): boolean {
  if (!from || !to) return false;
  const reqStart = new Date(from).getTime();
  const reqEnd = new Date(to).getTime();
  return bookings.some((b) => {
    const bStart = new Date(b.from).getTime();
    const bEnd = new Date(b.to).getTime();
    return reqStart < bEnd && reqEnd > bStart;
  });
}

// ═══════════════════════════════════════════════════════════════

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as any } },
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [requestSent, setRequestSent] = useState<Set<string>>(new Set());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestModal, setRequestModal] = useState<{
    show: boolean;
    coordinatorName: string;
    coordinatorEmail: string;
    subject: string;
    body: string;
  } | null>(null);

  // Booking time range (shared across all selected items per request)
  const [bookFrom, setBookFrom] = useState("");
  const [bookTo, setBookTo] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("htc_token");
    if (!token) return;
    fetch("http://localhost:4000/api/clubs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClubs(data.clubs);
      })
      .catch(console.error);
  }, []);

  const myClubs = useMemo(() => {
    return clubs.filter((c) => (user?.clubIds ?? []).includes(c.id));
  }, [clubs, user]);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCoordinator = (club: any) => {
    const coord = club.memberships?.find(
      (m: any) => m.tag === "COORDINATOR" || m.tag === "PRESIDENT"
    );
    return coord || null;
  };

  const handleRequestIssue = (clubName: string, club: any) => {
    const coordinator = getCoordinator(club);
    const clubItems = CLUB_INVENTORY[clubName] || [];
    const selected = clubItems.filter((i) => selectedItems.has(i.id));
    if (selected.length === 0) return;

    const email = coordinator?.email || "coordinator@iiitkota.ac.in";
    const itemList = selected.map((i) => `• ${i.name} (qty: ${i.quantity})`).join("\n");
    const timeRange = bookFrom && bookTo
      ? `\n\nRequired Duration:\nFrom: ${formatSlot(bookFrom)}\nTo: ${formatSlot(bookTo)}`
      : "";
    const subject = `Resource Issuance Request — ${clubName}`;
    const body = `Respected Sir/Ma'am,\n\nI, ${user?.name || "a club member"}, would like to request the issuance of the following items from ${clubName} club inventory:\n\n${itemList}${timeRange}\n\nKindly approve at your earliest convenience.\n\nThank you.`;

    setRequestModal({
      show: true,
      coordinatorName: coordinator?.name || "Club Coordinator",
      coordinatorEmail: email,
      subject,
      body,
    });
    setCopied(false);

    setRequestSent((prev) => {
      const next = new Set(prev);
      selected.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const copyToClipboard = async () => {
    if (!requestModal) return;
    const text = `To: ${requestModal.coordinatorEmail}\nSubject: ${requestModal.subject}\n\n${requestModal.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 flex items-center justify-center">
            <Package size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Club Resources</h1>
            <p className="text-sm text-slate-500">Inventory from your clubs</p>
          </div>
        </div>
      </motion.header>

      {myClubs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Package size={48} className="mx-auto text-surface-200/15 mb-4" />
          <p className="text-slate-500 text-sm">
            No clubs yet. Get assigned to a club to view its inventory.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8">
          {myClubs.map((club) => {
            const clubItems = CLUB_INVENTORY[club.name] || [];
            const coordinator = getCoordinator(club);
            const selectedInClub = clubItems.filter((i) => selectedItems.has(i.id));

            if (clubItems.length === 0) return null;

            return (
              <motion.section
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Club Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Buildings size={16} className="text-sky-400" />
                    <h2 className="text-lg font-semibold text-slate-800">{club.name}</h2>
                    <span className="text-xs text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full">
                      {clubItems.length} items
                    </span>
                  </div>
                  {coordinator && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck size={12} className="text-amber-400" />
                      <span>{coordinator.name}</span>
                    </div>
                  )}
                </div>

                {/* Inventory List */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-2"
                >
                  {clubItems.map((item) => {
                    const isChecked = selectedItems.has(item.id);
                    const isRequested = requestSent.has(item.id);
                    const statusCfg = STATUS_CONFIG[item.status];
                    const canSelect = item.status === "AVAILABLE";
                    const isExpanded = expandedItemId === item.id;

                    return (
                      <motion.div key={item.id} variants={fadeUp}>
                        <div
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer
                            ${!canSelect && !item.bookings.length ? "opacity-60" : ""}
                            ${isRequested
                              ? "bg-emerald-500/10 border border-emerald-500/25"
                              : isChecked
                                ? "bg-sky-500/10 border border-sky-500/25"
                                : "bg-surface-900/30 border border-surface-200/5 hover:border-surface-200/15"
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!canSelect || isRequested}
                            onChange={(e) => {
                              e.stopPropagation();
                              canSelect && toggleItem(item.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-slate-300/50 bg-white/60 text-sky-500 focus:ring-sky-500/30 cursor-pointer accent-sky-500"
                          />
                          <span className="text-lg">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${isChecked ? "text-slate-800" : "text-surface-200/70"}`}>
                                {item.name}
                              </span>
                              {isRequested && (
                                <CheckCircle size={13} className="text-emerald-400" />
                              )}
                              {item.bookings.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 font-semibold">
                                  {item.bookings.length} booking{item.bookings.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-400 font-medium mr-1">
                            qty: {item.quantity}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>

                        {/* Expanded: show existing bookings */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mt-1 mb-2 p-3 rounded-xl bg-surface-900/40 border border-surface-200/5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                                  <Calendar size={10} />
                                  Existing Bookings
                                </p>
                                {item.bookings.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No current bookings — fully available</p>
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    {item.bookings.map((b, idx) => {
                                      const bConflict = bookFrom && bookTo && hasConflict([b], bookFrom, bookTo);
                                      return (
                                        <div
                                          key={idx}
                                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                                            bConflict
                                              ? "bg-red-500/10 border border-red-500/20"
                                              : "bg-surface-900/30 border border-surface-200/5"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Clock size={10} className={bConflict ? "text-red-400" : "text-slate-500"} />
                                            <span className={bConflict ? "text-red-300 font-semibold" : "text-slate-500"}>
                                              {formatSlot(b.from)} → {formatSlot(b.to)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">{b.borrower}</span>
                                            {bConflict && (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                                                CONFLICT
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
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

                {/* Request Issuance Section */}
                <AnimatePresence>
                  {selectedInClub.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4"
                    >
                      <div className="glass rounded-xl p-4 mb-3">
                        {/* Time Range Picker */}
                        <div className="mb-4 p-3 rounded-xl bg-surface-900/40 border border-surface-200/5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                            <Clock size={10} className="text-sky-400" />
                            When do you need these?
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">From</label>
                              <input
                                type="datetime-local"
                                value={bookFrom}
                                onChange={(e) => setBookFrom(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/60 border border-slate-200/50 text-slate-800 text-xs focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">To</label>
                              <input
                                type="datetime-local"
                                value={bookTo}
                                onChange={(e) => setBookTo(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/60 border border-slate-200/50 text-slate-800 text-xs focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all [color-scheme:dark]"
                              />
                            </div>
                          </div>

                          {/* Conflict Warning */}
                          {bookFrom && bookTo && selectedInClub.some((i) => hasConflict(i.bookings, bookFrom, bookTo)) && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                            >
                              <Warning size={13} className="text-red-400 flex-shrink-0" />
                              <p className="text-xs text-red-300">
                                <span className="font-semibold">Scheduling conflict detected!</span> One or more items overlap with existing bookings. Click items to view details.
                              </p>
                            </motion.div>
                          )}

                          {bookFrom && bookTo && !selectedInClub.some((i) => hasConflict(i.bookings, bookFrom, bookTo)) && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                            >
                              <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                              <p className="text-xs text-emerald-300">
                                <span className="font-semibold">No conflicts!</span> Your time slot is clear.
                              </p>
                            </motion.div>
                          )}
                        </div>

                        {/* Permission info */}
                        <div className="flex items-start gap-2.5 mb-3">
                          <Warning size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">
                              Permission required from{" "}
                              <span className="text-slate-800 font-semibold">
                                {coordinator?.name || "Club Coordinator"}
                              </span>
                            </p>
                            {coordinator && (
                              <a
                                href={`mailto:${coordinator.email}`}
                                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 mt-1 transition-colors"
                              >
                                <Envelope size={10} />
                                {coordinator.email}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {selectedInClub.map((item) => (
                            <span
                              key={item.id}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                                hasConflict(item.bookings, bookFrom, bookTo)
                                  ? "bg-red-500/10 text-red-300 border border-red-500/15"
                                  : "bg-sky-500/10 text-sky-300 border border-sky-500/15"
                              }`}
                            >
                              {item.emoji} {item.name}
                              {hasConflict(item.bookings, bookFrom, bookTo) && " ⚠️"}
                            </span>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRequestIssue(club.name, club)}
                        className="
                          w-full py-3 rounded-xl
                          bg-gradient-to-r from-sky-500 to-cyan-600
                          hover:from-sky-400 hover:to-cyan-500
                          text-white font-semibold text-sm
                          shadow-[0_4px_24px_rgba(14,165,233,0.3)]
                          hover:shadow-[0_8px_32px_rgba(14,165,233,0.45)]
                          transition-all duration-300
                          flex items-center justify-center gap-2
                          cursor-pointer
                        "
                      >
                        <Envelope size={15} />
                        Request Issuance from Coordinator
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}

      {/* ── Permission Request Modal ────────────────────── */}
      <AnimatePresence>
        {requestModal?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setRequestModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-strong rounded-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Envelope size={18} className="text-sky-400" />
                  Permission Request
                </h3>
                <button
                  onClick={() => setRequestModal(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-surface-900/40 rounded-xl p-3 border border-surface-200/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">To</span>
                </div>
                <p className="text-sm text-slate-800 font-medium">{requestModal.coordinatorName}</p>
                <p className="text-xs text-sky-400">{requestModal.coordinatorEmail}</p>
              </div>

              <div className="bg-surface-900/40 rounded-xl p-3 border border-surface-200/5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Subject</span>
                <p className="text-sm text-slate-800 mt-1">{requestModal.subject}</p>
              </div>

              <div className="bg-surface-900/40 rounded-xl p-3 border border-surface-200/5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Message</span>
                <pre className="text-sm text-surface-200/70 mt-2 whitespace-pre-wrap font-sans leading-relaxed">{requestModal.body}</pre>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={copyToClipboard}
                  className={`
                    flex-1 py-3 rounded-xl font-semibold text-sm
                    flex items-center justify-center gap-2 cursor-pointer
                    transition-all duration-300
                    ${copied
                      ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                      : "bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-[0_4px_24px_rgba(14,165,233,0.3)]"
                    }
                  `}
                >
                  {copied ? (
                    <><CheckCircle size={15} /> Copied to Clipboard!</>
                  ) : (
                    <><Copy size={15} /> Copy to Clipboard</>
                  )}
                </motion.button>
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={`mailto:${requestModal.coordinatorEmail}?subject=${encodeURIComponent(requestModal.subject)}&body=${encodeURIComponent(requestModal.body)}`}
                  className="
                    py-3 px-5 rounded-xl font-semibold text-sm
                    flex items-center justify-center gap-2 cursor-pointer
                    bg-slate-100/80 border border-slate-200/50 text-slate-500
                    hover:border-slate-300/50 hover:text-slate-800 transition-all duration-300
                  "
                >
                  <Envelope size={15} /> Open Mail
                </motion.a>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Copy the message above and send it via email, WhatsApp, or any messenger
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
