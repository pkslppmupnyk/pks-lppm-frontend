import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { toast } from "react-toastify"; // Pastikan install react-toastify atau ganti dengan alert biasa

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [seq, setSeq] = useState(0);

  // Load data saat halaman dibuka
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const yearData = await adminService.getActiveYear();
      const seqData = await adminService.getLastSequence();

      setYear(yearData.year);
      setSeq(seqData.seq);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateYear = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateActiveYear(year);
      toast.success("Tahun penomoran berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal update tahun.");
    }
  };

  const handleUpdateSeq = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        "Apakah Anda yakin ingin mengubah nomor urut manual? Ini akan mempengaruhi nomor surat selanjutnya.",
      )
    )
      return;

    try {
      await adminService.updateLastSequence(seq);
      toast.success("Urutan nomor berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal update nomor urut.");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Memuat pengaturan...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Pengaturan Sistem
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CARD 1: PENGATURAN TAHUN */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">
            Tahun Surat
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Tahun ini akan muncul di akhir nomor surat (contoh: .../UN62/.../
            <b>2025</b>).
          </p>
          <form onSubmit={handleUpdateYear}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tahun Aktif
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-300"
                min="2000"
                max="2100"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition duration-200"
            >
              Simpan Tahun
            </button>
          </form>
        </div>

        {/* CARD 2: PENGATURAN NOMOR URUT */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-red-800 border-b pb-2">
            Reset / Edit Nomor Urut
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Angka di bawah adalah <b>nomor terakhir yang sudah dipakai</b>.
            Nomor surat berikutnya otomatis +1 dari angka ini.
          </p>
          <form onSubmit={handleUpdateSeq}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nomor Urut Terakhir
              </label>
              <input
                type="number"
                value={seq}
                onChange={(e) => setSeq(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-red-300"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: Jika diisi 50, maka surat berikutnya bernomor 51.
              </p>
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full transition duration-200"
            >
              Update Nomor Urut
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
