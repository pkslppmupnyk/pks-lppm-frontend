// src/pages/RegisterAdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

export default function RegisterAdminPage() {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.register(formData);
      alert(
        "Admin baru berhasil dibuat. Anda akan diarahkan ke halaman login."
      );
      authService.logout(); // Logout admin saat ini
      navigate("/login"); // Arahkan ke halaman login
    } catch (err) {
      setError(err.message || "Gagal membuat admin baru.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Tambah Admin Baru
      </h1>
      <div className="max-w-xl p-8 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="nama"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? "Menyimpan..." : "Buat Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
