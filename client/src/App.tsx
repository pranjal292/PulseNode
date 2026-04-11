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
import { CursorGlow } from "./components/CursorGlow";

function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <CursorGlow />

      {/* Ambient background */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#0d0c0b] text-white">
        {/* Grainy Noise Texture Filter */}
        <div 
          className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Structural center-left orange glow */}
        <div 
          className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full pointer-events-none mix-blend-screen"
          style={{
            background: "radial-gradient(circle at center, rgba(255,123,0,0.12) 0%, transparent 60%)",
            filter: "blur(60px)"
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
