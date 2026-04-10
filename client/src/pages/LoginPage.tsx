// ═══════════════════════════════════════════════════════════════
//  Login / Signup Page — Glassmorphism card with tab toggle
// ═══════════════════════════════════════════════════════════════

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignIn, UserPlus, Envelope, LockKey, User, SpinnerGap, Eye, EyeClosed } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let err: string | null;
    if (mode === "login") {
      err = await login(email, password);
    } else {
      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }
      err = await signup(name.trim(), email, password);
    }

    setLoading(false);
    if (err) setError(err);
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Ambient Blobs ───────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.35)] mb-4"
          >
            <span className="text-2xl font-bold text-white">H</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">HTC Community</h1>
          <p className="text-slate-500 text-sm mt-1">Your college, connected.</p>
        </div>

        {/* Glass Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-[0_16px_64px_rgba(0,0,0,0.4)]">
          {/* Tab Toggle */}
          <div className="flex bg-slate-100/80 rounded-xl p-1 mb-6">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-semibold
                  transition-all duration-300 cursor-pointer
                  flex items-center justify-center gap-2
                  ${mode === m
                    ? "bg-gradient-to-r from-sky-500/80 to-blue-500/80 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-600"
                  }
                `}
              >
                {m === "login" ? <SignIn size={15} /> : <UserPlus size={15} />}
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Pranjal Swami"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@htc.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <LockKey size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/60 border border-slate-200/50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
                >
                  {showPw ? <EyeClosed size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5 rounded-xl
                bg-gradient-to-r from-sky-500 to-blue-600
                hover:from-sky-400 hover:to-blue-500
                text-white font-semibold text-sm
                shadow-[0_4px_24px_rgba(99,102,241,0.35)]
                hover:shadow-[0_8px_32px_rgba(99,102,241,0.5)]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                cursor-pointer
              "
            >
              {loading ? (
                <SpinnerGap size={18} className="animate-spin" />
              ) : mode === "login" ? (
                <>
                  <SignIn size={16} /> Sign In
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>


        </div>
      </motion.div>
    </div>
  );
}
