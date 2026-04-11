// ═══════════════════════════════════════════════════════════════
//  Plan Event Page — Create events with inventory requirements
//  Visible to: PRESIDENT, COORDINATOR
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarPlus, MapPin, Clock, PaperPlaneRight, CheckCircle, Package, Warning, Envelope, User, Buildings, Copy, Ruler, ProjectorScreen, SpeakerHifi, MicrophoneStage, Desktop, Bank, Student, Armchair, Tree, Laptop, Desk, MaskHappy, ClipboardText, Plug } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

// ═══════════════════════════════════════════════════════════════
//  College Inventory Catalog
// ═══════════════════════════════════════════════════════════════

interface InventoryItem {
  id: string;
  name: string;
  icon: any;
  category: string;
  custodian: string;         // Who manages this item
  custodianEmail: string;    // Email of the custodian
  custodianRole: string;     // Department / designation
  quantity: number;          // Available count
}

const INVENTORY: InventoryItem[] = [
  // ── AV & Tech ──────────────────────────────────────────
  { id: "inv-1",  name: "DSLR Camera",            icon: Package, category: "AV & Tech",        custodian: "Prof. R. K. Jain",         custodianEmail: "rk.jain.ece@iiitkota.ac.in",      custodianRole: "ECE Lab In-charge",     quantity: 3 },
  { id: "inv-2",  name: "Video Camera (Handycam)", icon: Package, category: "AV & Tech",        custodian: "Prof. R. K. Jain",         custodianEmail: "rk.jain.ece@iiitkota.ac.in",      custodianRole: "ECE Lab In-charge",     quantity: 2 },
  { id: "inv-3",  name: "Tripod Stand",            icon: Ruler, category: "AV & Tech",        custodian: "Prof. R. K. Jain",         custodianEmail: "rk.jain.ece@iiitkota.ac.in",      custodianRole: "ECE Lab In-charge",     quantity: 5 },
  { id: "inv-4",  name: "Projector",               icon: ProjectorScreen, category: "AV & Tech",       custodian: "Dr. Suman Meena",          custodianEmail: "suman.meena.cse@iiitkota.ac.in",  custodianRole: "CSE Lab In-charge",     quantity: 4 },
  { id: "inv-5",  name: "Portable Speaker System", icon: SpeakerHifi, category: "AV & Tech",        custodian: "Administrative Office",    custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 3 },
  { id: "inv-6",  name: "Wireless Microphone Set",  icon: MicrophoneStage, category: "AV & Tech",       custodian: "Administrative Office",    custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 6 },
  { id: "inv-7",  name: "LED Screen / Display",    icon: Desktop, category: "AV & Tech",       custodian: "Dr. Suman Meena",          custodianEmail: "suman.meena.cse@iiitkota.ac.in",  custodianRole: "CSE Lab In-charge",     quantity: 2 },

  // ── Venues ──────────────────────────────────────────────
  { id: "inv-8",  name: "Main Auditorium",          icon: Bank, category: "Venues",          custodian: "Dean of Student Affairs",  custodianEmail: "dean.sa@iiitkota.ac.in",          custodianRole: "Dean SA Office",        quantity: 1 },
  { id: "inv-9",  name: "Seminar Hall (Block A)",  icon: Student, category: "Venues",           custodian: "Prof. A. K. Sharma",       custodianEmail: "ak.sharma.hmas@iiitkota.ac.in",   custodianRole: "HMAS HOD",              quantity: 1 },
  { id: "inv-10", name: "Lecture Hall (LH-1)",     icon: Armchair, category: "Venues",           custodian: "Administrative Office",    custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 1 },
  { id: "inv-11", name: "Lecture Hall (LH-2)",     icon: Armchair, category: "Venues",           custodian: "Administrative Office",    custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 1 },
  { id: "inv-12", name: "Open Air Theatre",        icon: Tree, category: "Venues",           custodian: "Dean of Student Affairs",  custodianEmail: "dean.sa@iiitkota.ac.in",          custodianRole: "Dean SA Office",        quantity: 1 },
  { id: "inv-13", name: "Computer Lab (Lab-1)",    icon: Laptop, category: "Venues",           custodian: "Dr. Suman Meena",          custodianEmail: "suman.meena.cse@iiitkota.ac.in",  custodianRole: "CSE Lab In-charge",     quantity: 1 },

  // ── Furniture & Setup ───────────────────────────────────
  { id: "inv-14", name: "Folding Tables",           icon: Desk, category: "Furniture & Setup", custodian: "Administrative Office",  custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 20 },
  { id: "inv-15", name: "Plastic Chairs (set of 50)", icon: Armchair, category: "Furniture & Setup", custodian: "Administrative Office", custodianEmail: "admin@iiitkota.ac.in",           custodianRole: "Admin Office",          quantity: 4 },
  { id: "inv-16", name: "Stage / Podium",           icon: MaskHappy, category: "Furniture & Setup", custodian: "Dean of Student Affairs", custodianEmail: "dean.sa@iiitkota.ac.in",         custodianRole: "Dean SA Office",        quantity: 1 },
  { id: "inv-17", name: "Whiteboard (Portable)",    icon: ClipboardText, category: "Furniture & Setup", custodian: "Administrative Office",  custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 6 },
  { id: "inv-18", name: "Extension Cords / Power Strips", icon: Plug, category: "Furniture & Setup", custodian: "Maintenance Dept",  custodianEmail: "maintenance@iiitkota.ac.in",     custodianRole: "Maintenance",           quantity: 10 },

  // ── Sports & Outdoors ───────────────────────────────────
  { id: "inv-19", name: "Sports Ground Booking",    icon: Package, category: "Sports & Outdoors", custodian: "FIC Sports",              custodianEmail: "sports@iiitkota.ac.in",           custodianRole: "FIC Sports",            quantity: 1 },
  { id: "inv-20", name: "Tents / Canopy Shade",    icon: Package, category: "Sports & Outdoors", custodian: "Administrative Office",   custodianEmail: "admin@iiitkota.ac.in",            custodianRole: "Admin Office",          quantity: 4 },
];

// Group inventory by category
const CATEGORIES = [...new Set(INVENTORY.map((i) => i.category))];

// ═══════════════════════════════════════════════════════════════

interface PermissionEntry {
  custodian: string;
  custodianEmail: string;
  custodianRole: string;
  items: string[];
}

export default function PlanEventPage() {
  useAuth(); // ensure authenticated
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [permissionList, setPermissionList] = useState<PermissionEntry[] | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch clubs
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

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Reset permission list when selection changes
    setPermissionList(null);
  };

  const generatePermissionList = () => {
    if (selectedItems.size === 0) return;

    // Group selected items by custodian email
    const grouped = new Map<string, PermissionEntry>();
    selectedItems.forEach((id) => {
      const item = INVENTORY.find((i) => i.id === id);
      if (!item) return;

      const existing = grouped.get(item.custodianEmail);
      if (existing) {
        existing.items.push(item.name);
      } else {
        grouped.set(item.custodianEmail, {
          custodian: item.custodian,
          custodianEmail: item.custodianEmail,
          custodianRole: item.custodianRole,
          items: [item.name],
        });
      }
    });

    setPermissionList(Array.from(grouped.values()));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !location.trim()) return;
    setError("");

    const token = localStorage.getItem("htc_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:4000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          startTime,
          endTime,
          location,
          clubId: clubId || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create event");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setClubId("");
        setSelectedItems(new Set());
        setPermissionList(null);
        setSuccess(false);
      }, 3000);
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-2xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <CalendarPlus size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Plan Event</h1>
            <p className="text-sm text-surface-200/50">Schedule & request resources</p>
          </div>
        </div>
      </motion.header>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {/* ── Event Details Card ─────────────────────────── */}
        <div className="glass-strong rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-surface-200/50 uppercase tracking-wider flex items-center gap-2">
            <CalendarPlus size={14} className="text-emerald-400" />
            Event Details
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="TechNova 2026 — Hackathon"
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm placeholder:text-surface-200/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this event about?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm placeholder:text-surface-200/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
            />
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
                <CalendarPlus size={11} className="inline mr-1" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
                <Clock size={11} className="inline mr-1" /> Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
                <Clock size={11} className="inline mr-1" /> End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Location + Club row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
                <MapPin size={11} className="inline mr-1" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Auditorium"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm placeholder:text-surface-200/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-200/50 mb-1.5 uppercase tracking-wider">
                Club
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-200/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer appearance-none"
              >
                <option value="">🌐 College-wide</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Inventory Requirements Card ────────────────── */}
        <div className="glass-strong rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-200/50 uppercase tracking-wider flex items-center gap-2">
              <Package size={14} className="text-amber-400" />
              Requirements — College Inventory
            </h2>
            {selectedItems.size > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {selectedItems.size} selected
              </span>
            )}
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-[11px] font-semibold text-surface-200/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Buildings size={10} />
                {cat}
              </p>
              <div className="flex flex-col gap-1.5">
                {INVENTORY.filter((i) => i.category === cat).map((item) => {
                  const isChecked = selectedItems.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
                        ${isChecked
                          ? "bg-amber-500/10 border border-amber-500/25"
                          : "bg-surface-900/30 border border-surface-200/5 hover:border-surface-200/15"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4 rounded border-surface-200/20 bg-surface-900/50 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                      />
                      <span className="text-lg"><item.icon size={20} weight="duotone" /></span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${isChecked ? "text-white" : "text-surface-200/70"}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-900/60 text-surface-200/30 font-medium">
                        qty: {item.quantity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Generate Permission List Button ────────────── */}
        {selectedItems.size > 0 && !permissionList && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={generatePermissionList}
            className="
              w-full py-3.5 rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-600
              hover:from-amber-400 hover:to-orange-500
              text-white font-semibold text-sm
              shadow-[0_4px_24px_rgba(245,158,11,0.3)]
              hover:shadow-[0_8px_32px_rgba(245,158,11,0.45)]
              transition-all duration-300
              flex items-center justify-center gap-2
              cursor-pointer
            "
          >
            <Warning size={16} />
            Generate Permission List
          </motion.button>
        )}

        {/* ── Permission List Result ─────────────────────── */}
        <AnimatePresence>
          {permissionList && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-strong rounded-2xl p-6 flex flex-col gap-4"
            >
              <h2 className="text-sm font-semibold text-surface-200/50 uppercase tracking-wider flex items-center gap-2">
                <Warning size={14} className="text-rose-400" />
                Permission Required From
              </h2>

              <div className="flex flex-col gap-3">
                {permissionList.map((entry, i) => (
                  <motion.div
                    key={entry.custodianEmail}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-surface-900/40 rounded-xl p-4 border border-surface-200/8"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{entry.custodian}</p>
                        <p className="text-xs text-surface-200/50 mb-2">{entry.custodianRole}</p>
                        <p className="text-xs text-orange-400 mb-1 flex items-center gap-1">
                          <Envelope size={11} />
                          {entry.custodianEmail}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = `To: ${entry.custodianEmail}\nSubject: Permission Request: ${title || "Event"} — Resource Issuance\n\nRespected Sir/Ma'am,\n\nI am writing to request permission for the issuance of the following resources for the event "${title || "our upcoming event"}" scheduled on ${date || "[date]"}.\n\nResources needed:\n${entry.items.map(it => `• ${it}`).join('\n')}\n\nKindly approve at your earliest convenience.\n\nThank you.`;
                            navigator.clipboard.writeText(msg).then(() => {
                              setCopiedEmail(entry.custodianEmail);
                              setTimeout(() => setCopiedEmail(null), 2000);
                            });
                          }}
                          className={`
                            inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                            transition-all cursor-pointer mt-1
                            ${copiedEmail === entry.custodianEmail
                              ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                              : "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
                            }
                          `}
                        >
                          {copiedEmail === entry.custodianEmail ? (
                            <><CheckCircle size={11} /> Copied!</>
                          ) : (
                            <><Copy size={11} /> Copy Request Email</>
                          )}
                        </button>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {entry.items.map((itemName) => (
                            <span
                              key={itemName}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/15 font-medium"
                            >
                              {itemName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-surface-200/30 text-center italic mt-1">
                Click "Copy Request Email" on each card, then paste into your email or messenger
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ──────────────────────────────────────── */}
        {error && (
          <div className="py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Submit ─────────────────────────────────────── */}
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
              Event planned successfully!
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="
                w-full py-3.5 rounded-xl
                bg-gradient-to-r from-emerald-500 to-teal-600
                hover:from-emerald-400 hover:to-teal-500
                text-white font-semibold text-sm
                shadow-[0_4px_24px_rgba(52,211,153,0.3)]
                hover:shadow-[0_8px_32px_rgba(52,211,153,0.45)]
                transition-all duration-300
                flex items-center justify-center gap-2
                cursor-pointer
              "
            >
              <PaperPlaneRight size={16} />
              Plan Event
            </motion.button>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
