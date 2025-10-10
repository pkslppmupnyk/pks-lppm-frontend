import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Halaman Publik
import PublicDashboard from "./pages/PublicDashboard";
import SubmitPksPage from "./pages/SubmitPksPage";
import PksTrackingPage from "./pages/PksTrackingPage";

// Halaman Admin
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import PksDetailPage from "./pages/PksDetailPage";
import EditPksPage from "./pages/EditPksPage";
import RegisterAdminPage from "./pages/RegisterAdminPage";

// Komponen utilitas
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === RUTE PUBLIK / NON-ADMIN === */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/submit-pks" element={<SubmitPksPage />} />
          <Route path="/track/:nomor" element={<PksTrackingPage />} />
        </Route>

        {/* === RUTE ADMIN & LOGIN === */}
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pks/:nomor" element={<PksDetailPage />} />
            <Route path="pks/:nomor/edit" element={<EditPksPage />} />
            <Route path="register-admin" element={<RegisterAdminPage />} />
            <Route index element={<Navigate to="/admin/dashboard" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
