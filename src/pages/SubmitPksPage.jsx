// src/pages/SubmitPksPage.jsx
import React, { useState } from "react";
import pksService from "../services/pksService";
import { Link, useNavigate } from "react-router-dom";

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
      telepon: "",
      reminderDate: "",
      cakupanKerjaSama: "dalam negeri",
    },
    // --- TAMBAHAN DATA MOU ---
    mou: {
      hasMoU: false,
      nomorUpn: "",
      nomorMitra: "",
      judul: "",
      tanggalMulai: "",
      tanggalSelesai: "",
    },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Handle input change (termasuk checkbox)
  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    const { section } = dataset;

    // Jika type checkbox, gunakan checked, jika tidak gunakan value
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: finalValue,
      },
    }));
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validasi Manual untuk MoU jika hasMoU true (backup validasi frontend)
    if (formData.mou.hasMoU) {
      if (
        !formData.mou.nomorUpn ||
        !formData.mou.nomorMitra ||
        !formData.mou.judul ||
        !formData.mou.tanggalMulai
      ) {
        setMessage({
          type: "error",
          text: "Mohon lengkapi data MoU (Nomor, Judul, Tanggal Mulai) karena Anda mencentang opsi ada MoU.",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const createResponse = await pksService.createPks(formData);
      const newPksId = createResponse.data?._id;

      if (!newPksId) throw new Error("Gagal mendapatkan ID PKS.");

      if (logoFile) {
        await pksService.uploadLogo(newPksId, logoFile);
      }

      setMessage({
        type: "success",
        text: "PKS berhasil diajukan! Mengalihkan...",
      });

      setTimeout(() => {
        navigate(`/admin/pks/${newPksId}`); // Redirect ke detail (bukan tracking public) agar admin bisa langsung cek
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
            Form Pengajuan PKS
          </h2>
          <Link
            to="/admin/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke Dashboard
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- BAGIAN 1: MOU MENAUNGI (BARU) --- */}
          <fieldset className="p-4 border border-blue-200 bg-blue-50 rounded-md">
            <legend className="px-2 font-semibold text-lg text-blue-800">
              Dasar MoU (Memorandum of Understanding)
            </legend>

            <div className="mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="hasMoU"
                  data-section="mou"
                  checked={formData.mou.hasMoU}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700 font-medium">
                  Apakah PKS ini dinaungi oleh MoU Induk?
                </span>
              </label>
            </div>

            {formData.mou.hasMoU && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-down">
                <div>
                  <label>Nomor MoU (UPN)*</label>
                  <input
                    type="text"
                    name="nomorUpn"
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                    placeholder="No. MoU versi UPN"
                  />
                </div>
                <div>
                  <label>Nomor MoU (Mitra)*</label>
                  <input
                    type="text"
                    name="nomorMitra"
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                    placeholder="No. MoU versi Mitra"
                  />
                </div>
                <div className="md:col-span-2">
                  <label>Judul MoU*</label>
                  <input
                    type="text"
                    name="judul"
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                    placeholder="Judul lengkap dokumen MoU"
                  />
                </div>
                <div>
                  <label>Tanggal Mulai MoU*</label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>Tanggal Selesai MoU (Opsional)</label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    data-section="mou"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </fieldset>

          {/* BAGIAN 2: DETAIL PKS */}
          <fieldset className="p-4 border rounded-md">
            <legend className="px-2 font-semibold text-lg text-gray-700">
              Detail Perjanjian (PKS)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Judul Kerjasama (PKS)*</label>
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
                <label>Nomor WhatsApp</label>
                <input
                  type="tel"
                  name="telepon"
                  data-section="properties"
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="08xxxxxxxxxx"
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
                <label>Tanggal Mulai PKS*</label>
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
                <label>Tanggal Kadaluarsa PKS*</label>
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
                <label>Set Pengingat (Reminder)</label>
                <input
                  type="date"
                  name="reminderDate"
                  data-section="properties"
                  onChange={handleChange}
                  className={inputClass}
                />
                <small className="text-gray-500">
                  Email akan dikirim pada tanggal ini.
                </small>
              </div>
            </div>
          </fieldset>

          {/* BAGIAN 3: PIHAK KEDUA */}
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
                <label>Nomor Dokumen Pihak Kedua (PKS)</label>
                <input
                  type="text"
                  name="nomor"
                  data-section="pihakKedua"
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Nomor surat dari mitra"
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
              <div className="md:col-span-2">
                <label>Logo Instansi (Opsional)</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
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
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Mengirim Data..." : "Ajukan PKS"}
          </button>
        </form>
      </div>
    </div>
  );
}
