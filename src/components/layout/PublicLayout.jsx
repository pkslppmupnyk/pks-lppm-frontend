import React from "react";
// 1. Impor Outlet dari react-router-dom
import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center">
            <img src="/logo_upn.png" alt="Logo UPNYK" className="h-12 mr-4" />
            <h1 className="text-xl md:text-2xl font-bold">
              Pengajuan PKS LPPM UPNYK
            </h1>
          </div>
          <Link
            to="/login"
            className="bg-white text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Login Admin
          </Link>
        </div>
      </header>
      <main>
        {/* 2. Tambahkan Outlet di sini */}
        <Outlet />
      </main>
    </div>
  );
}
