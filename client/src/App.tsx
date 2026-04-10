// ═══════════════════════════════════════════════════════════════
//  App — Root with Auth Guard + Routing
// ═══════════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import BottomNav from "./components/BottomNav";
import LoginPage from "./pages/LoginPage";
import UpdatesPage from "./pages/UpdatesPage";
import ClubsPage from "./pages/ClubsPage";
import AnnouncementPage from "./pages/AnnouncementPage";
import PlanEventPage from "./pages/PlanEventPage";
import EditTagsPage from "./pages/EditTagsPage";
import ResourcesPage from "./pages/ResourcesPage";

function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      {/* Ambient background — persistent across pages */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<UpdatesPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/announcement" element={<AnnouncementPage />} />
          <Route path="/plan-event" element={<PlanEventPage />} />
          <Route path="/edit-tags" element={<EditTagsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <BottomNav userTag={user.tag} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
