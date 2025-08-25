// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ElderLogin from "./pages/Elder/Login";
import GovLogin from "./pages/Gov/Login";
import GovChat from "./pages/Gov/Chat";
import Terms from "./pages/Legal/Terms";
import Privacy from "./pages/Legal/Privacy";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F3E6] text-[#2F3A2F]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 공무원 */}
          <Route path="/gov" element={<GovLogin />} />
          <Route path="/gov/login" element={<GovLogin />} />
          <Route path="/gov/chat" element={<GovChat />} />

          {/* 어르신 */}
          <Route path="/elder" element={<ElderLogin />} />
          <Route path="/elder/login" element={<ElderLogin />} />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}