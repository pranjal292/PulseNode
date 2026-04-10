// ═══════════════════════════════════════════════════════════════
//  BottomNav — Pill-Shaped Adaptive Navigation Bar
//  Dynamically adjusts items + width based on UserTag
// ═══════════════════════════════════════════════════════════════

import { useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Users, Megaphone, CalendarPlus, UserGear, FolderOpen, type Icon } from "@phosphor-icons/react";
import { UserTag } from "../types";

interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  path: string;
}

const ALL_ITEMS: Record<string, NavItem> = {
  updates:      { id: "updates",      label: "Updates",    icon: Newspaper,    path: "/" },
  clubs:        { id: "clubs",        label: "Clubs",      icon: Users,        path: "/clubs" },
  announcement: { id: "announcement", label: "Announce",   icon: Megaphone,    path: "/announcement" },
  planEvent:    { id: "planEvent",    label: "Plan Event", icon: CalendarPlus, path: "/plan-event" },
  editTags:     { id: "editTags",     label: "Edit Tags",  icon: UserGear,     path: "/edit-tags" },
  resources:    { id: "resources",    label: "Resources",  icon: FolderOpen,   path: "/resources" },
};

const TAG_NAV_MAP: Record<UserTag, string[]> = {
  [UserTag.FACULTY]:     ["updates", "clubs", "announcement"],
  [UserTag.PRESIDENT]:   ["updates", "clubs", "planEvent", "announcement", "editTags"],
  [UserTag.COORDINATOR]: ["updates", "clubs", "planEvent", "announcement", "editTags"],
  [UserTag.CLUB_MEMBER]: ["updates", "clubs", "resources"],
  [UserTag.STUDENT]:     ["updates", "clubs"],
};

interface BottomNavProps {
  userTag: UserTag;
}

export default function BottomNav({ userTag }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = useMemo(() => {
    const keys = TAG_NAV_MAP[userTag] ?? TAG_NAV_MAP[UserTag.STUDENT];
    return keys.map((k) => ALL_ITEMS[k]);
  }, [userTag]);

  // If current path doesn't exist in nav items, redirect to home
  useEffect(() => {
    const currentItemExists = items.some((i) => i.path === location.pathname);
    if (!currentItemExists) {
      navigate("/", { replace: true });
    }
  }, [items, location.pathname, navigate]);

  const activeId = items.find((i) => i.path === location.pathname)?.id ?? "updates";

  return (
    <motion.nav
      layout
      transition={{ type: "spring", stiffness: 400, damping: 34, mass: 0.8 }}
      className="
        fixed bottom-5 left-1/2 z-50
        glass-strong rounded-full
        shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.12)]
      "
      style={{ x: "-50%" }}
    >
      <motion.div
        layout
        className="flex items-center gap-1 px-2 py-2"
        transition={{ type: "spring", stiffness: 400, damping: 34, mass: 0.8 }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.5, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(8px)" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.6,
                  opacity: { duration: 0.2 },
                }}
                onClick={() => navigate(item.path)}
                className={`
                  relative flex items-center gap-2
                  px-4 py-2.5 rounded-full
                  text-sm font-medium
                  transition-colors duration-200
                  cursor-pointer select-none
                  outline-none focus-visible:ring-2 focus-visible:ring-accent/50
                  ${isActive
                    ? "text-slate-800"
                    : "text-slate-500 hover:text-slate-600"
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="
                      absolute inset-0 rounded-full
                      bg-gradient-to-r from-sky-500/80 to-blue-600/70
                      shadow-[0_0_20px_rgba(56,189,248,0.3)]
                    "
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 32,
                      mass: 0.7,
                    }}
                  />
                )}

                <motion.span className="relative z-10" layout>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="transition-all duration-200"
                  />
                </motion.span>

                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.span
                      key={`label-${item.id}`}
                      className="relative z-10 whitespace-nowrap text-[13px] font-semibold"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  );
}
