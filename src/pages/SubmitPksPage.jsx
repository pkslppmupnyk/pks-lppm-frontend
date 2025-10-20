// src/pages/SubmitPksPage.jsx

import React, { useState } from "react";
import pksService from "../services/pksService";
import { Link } from "react-router-dom";

export default function SubmitPksPage() {
  const [formData, setFormData] = useState({
    content: {
      judul: "",
      tanggal: "",
      tanggalKadaluarsa: "",
    },
    pihakKedua: {
      instansi: "",
      nama: "",
      jabatan: "",
      alamat: "",
      nomor: "",
    },
    properties: {
      email: "",
      reminderDate: "",
      cakupanKerjaSama: "dalam negeri", // Nilai default
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    const { section } = dataset;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const createResponse = await pksService.createPks(formData);
      const newPksId = createResponse.data?._id;

      if (!newPksId) {
        throw new Error("Gagal mendapatkan ID PKS setelah dibuat.");
      }

      setMessage({
        type: "success",
        text: "PKS berhasil diajukan! Anda akan diarahkan otomatis.",
      });

      // Arahkan ke halaman tracking setelah 2 detik
      setTimeout(() => {
        window.location.href = `/track/${newPksId}`;
      }, 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal mengajukan PKS.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Form Pengajuan Perjanjian Kerja Sama (PKS)
          </h2>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            &larr; Kembali ke Halaman Utama
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Detail Perjanjian */}
          <fieldset className="p-4 border rounded-md">
            <legend className="px-2 font-semibold text-lg text-gray-700">
              Detail Perjanjian
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Judul Kerjasama*</label>
                <input
                  type="text"
                  name="judul"
                  data-section="content"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label>Email Pemberitahuan*</label>
                <input
                  type="email"
                  name="email"
                  data-section="properties"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label>Tanggal Mulai*</label>
                <input
                  type="date"
                  name="tanggal"
                  data-section="content"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label>Tanggal Kadaluarsa*</label>
                <input
                  type="date"
                  name="tanggalKadaluarsa"
                  data-section="content"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label>Cakupan Kerjasama*</label>
                <select
                  name="cakupanKerjaSama"
                  data-section="properties"
                  value={formData.properties.cakupanKerjaSama}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="dalam negeri">Dalam Negeri</option>
                  <option value="luar negeri">Luar Negeri</option>
                </select>
              </div>
              <div>
                <label>Tanggal Pengingat</label>
                <input
                  type="date"
                  name="reminderDate"
                  data-section="properties"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          {/* Section 2: Pihak Kedua */}
          <fieldset className="p-4 border rounded-md">
            <legend className="px-2 font-semibold text-lg text-gray-700">
              Informasi Pihak Kedua
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Nama Instansi*</label>
                <input
                  type="text"
                  name="instansi"
                  data-section="pihakKedua"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label>Nomor Dokumen Pihak Kedua</label>
                <input
                  type="text"
                  name="nomor"
                  data-section="pihakKedua"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label>Nama Penanggung Jawab*</label>
                <input
                  type="text"
                  name="nama"
                  data-section="pihakKedua"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label>Jabatan*</label>
                <input
                  type="text"
                  name="jabatan"
                  data-section="pihakKedua"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label>Alamat Instansi*</label>
                <textarea
                  name="alamat"
                  data-section="pihakKedua"
                  onChange={handleChange}
                  required
                  className={inputClass}
                ></textarea>
              </div>
            </div>
          </fieldset>

          {message.text && (
            <div
              className={`p-4 rounded-md text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Mengirim..." : "Ajukan PKS"}
          </button>
        </form>
      </div>
    </div>
  );
}
