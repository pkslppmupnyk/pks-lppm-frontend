import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Halaman Publik
import PublicDashboard from "./pages/PublicDashboard";
import SubmitPksPage from "./pages/SubmitPksPage";
import PksTrackingPage from "./pages/PksTrackingPage";
import PanduanPage from "./pages/PanduanPage";

// Halaman Admin
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import PksDetailPage from "./pages/PksDetailPage";
import EditPksPage from "./pages/EditPksPage";
import RegisterAdminPage from "./pages/RegisterAdminPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import PksTablePage from "./pages/PksTablePage"; // <--- IMPORT HALAMAN BARU

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
          <Route path="/track/:id" element={<PksTrackingPage />} />
          <Route path="/panduan" element={<PanduanPage />} />
        </Route>

        {/* === RUTE ADMIN & LOGIN === */}
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* RUTE BARU: TAMPILAN TABEL */}
            <Route path="pks-table" element={<PksTablePage />} />

            <Route path="pks/:id" element={<PksDetailPage />} />
            <Route path="pks/:id/edit" element={<EditPksPage />} />
            <Route path="register-admin" element={<RegisterAdminPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />

            <Route index element={<Navigate to="/admin/dashboard" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
