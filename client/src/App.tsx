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
        <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      {/* Ambient glassmorphic background */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50 text-slate-800">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-sky-500/15 mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-blue-300/10 mix-blend-screen filter blur-[90px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-slate-300/10 mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
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
