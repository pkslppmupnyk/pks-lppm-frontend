// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");

  // Jika token ada, izinkan akses ke halaman yang dituju (Outlet)
  // Jika tidak, tendang kembali ke halaman login
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
