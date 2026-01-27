import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

export default function AdminLayout() {
  const [adminName, setAdminName] = useState("Admin");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.data && response.data.nama) {
          setAdminName(response.data.nama);
        }
      } catch (error) {
        handleLogout();
      }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-4 flex flex-col">
        <div className="text-2xl font-bold mb-8">PKS LPPM</div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              <Link
                to="/admin/dashboard"
                className="block p-2 rounded hover:bg-gray-700"
              >
                Dasbor PKS
              </Link>
            </li>
            {/* --- TAMBAHKAN MENU BARU DI SINI --- */}
            <li className="mb-4">
              <Link
                to="/admin/register-admin"
                className="block p-2 rounded hover:bg-gray-700"
              >
                Tambah Admin Baru
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/admin/settings"
                className="block p-2 rounded hover:bg-gray-700"
              >
                Pengaturan Nomor dan Tahun
              </Link>
            </li>
            {/* ---------------------------------- */}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-end items-center p-4 bg-white border-b">
          <span className="mr-4 text-gray-800">
            Selamat datang, <strong>{adminName}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
