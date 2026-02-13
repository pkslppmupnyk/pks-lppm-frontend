// src/pages/SubmitPksPage.jsx
import React, { useState } from "react";
import pksService from "../services/pksService";
import { Link, useNavigate } from "react-router-dom";

export default function SubmitPksPage() {
  const [formData, setFormData] = useState({
    content: {
      judul: "",
      bentukKerjaSama: [],
      jenisPengabdian: "",
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
    // --- DATA MOU ---
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

  // Cek status login untuk navigasi UI
  const isLoggedIn = !!localStorage.getItem("authToken");

  // Handle input change umum
  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    const { section } = dataset;

    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: finalValue,
      },
    }));
  };

  // Handle khusus untuk Checkbox Array (Bentuk Kerja Sama)
  const handleBentukKerjaSamaChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentArr = prev.content.bentukKerjaSama || [];
      let newArr;

      if (checked) {
        newArr = [...currentArr, value];
      } else {
        newArr = currentArr.filter((item) => item !== value);
      }

      // Reset jenisPengabdian jika "Pengabdian Masyarakat" di-uncheck
      const shouldResetJenis =
        !checked && value === "Pengabdian Masyarakat"
          ? ""
          : prev.content.jenisPengabdian;

      return {
        ...prev,
        content: {
          ...prev.content,
          bentukKerjaSama: newArr,
          jenisPengabdian: shouldResetJenis,
        },
      };
    });
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // 1. Validasi MoU
    if (formData.mou.hasMoU) {
      if (
        !formData.mou.nomorUpn ||
        !formData.mou.nomorMitra ||
        !formData.mou.judul ||
        !formData.mou.tanggalMulai
      ) {
        setMessage({
          type: "error",
          text: "Mohon lengkapi data MoU (Nomor, Judul, Tanggal Mulai).",
        });
        setLoading(false);
        return;
      }
    }

    // 2. Validasi Bentuk Kerja Sama
    if (formData.content.bentukKerjaSama.length === 0) {
      setMessage({
        type: "error",
        text: "Pilih minimal satu Bentuk Kerja Sama (Penelitian atau Pengabdian).",
      });
      setLoading(false);
      return;
    }

    // 3. Validasi Jenis Pengabdian
    if (
      formData.content.bentukKerjaSama.includes("Pengabdian Masyarakat") &&
      !formData.content.jenisPengabdian
    ) {
      setMessage({
        type: "error",
        text: "Anda memilih Pengabdian Masyarakat, wajib memilih Jenis Pengabdian.",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(JSON.stringify(formData));

      // Hapus field jenisPengabdian jika tidak relevan agar tidak kena validasi enum
      if (!payload.content.bentukKerjaSama.includes("Pengabdian Masyarakat")) {
        delete payload.content.jenisPengabdian;
      }

      const createResponse = await pksService.createPks(payload);
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
        // --- LOGIKA NAVIGASI (REVISI) ---
        const token = localStorage.getItem("authToken");
        if (token) {
          // Jika Admin, ke Dashboard Admin
          navigate("/admin/dashboard");
        } else {
          // Jika User Umum, ke Halaman Utama (Home)
          navigate("/");
        }
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
            to={isLoggedIn ? "/admin/dashboard" : "/"}
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke {isLoggedIn ? "Dashboard" : "Beranda"}
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- BAGIAN 1: MOU MENAUNGI --- */}
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
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Bentuk Kerja Sama (Pilih Minimal 1)*
                </label>
                <div className="flex gap-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value="Penelitian"
                      checked={formData.content.bentukKerjaSama.includes(
                        "Penelitian",
                      )}
                      onChange={handleBentukKerjaSamaChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Penelitian</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value="Pengabdian Masyarakat"
                      checked={formData.content.bentukKerjaSama.includes(
                        "Pengabdian Masyarakat",
                      )}
                      onChange={handleBentukKerjaSamaChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">
                      Pengabdian Masyarakat
                    </span>
                  </label>
                </div>
              </div>

              {formData.content.bentukKerjaSama.includes(
                "Pengabdian Masyarakat",
              ) && (
                <div className="md:col-span-2 animate-fade-in-down">
                  <label className="block mb-1 font-medium text-gray-700">
                    Jenis Pengabdian*
                  </label>
                  <select
                    name="jenisPengabdian"
                    data-section="content"
                    value={formData.content.jenisPengabdian}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">-- Pilih Jenis Pengabdian --</option>
                    <option value="Pengabdian bagi Masyarakat Umum">
                      Pengabdian bagi Masyarakat Umum
                    </option>
                    <option value="Pengabdian bagi Masyarakat Industri">
                      Pengabdian bagi Masyarakat Industri
                    </option>
                    <option value="Pengabdian bagi Masyarakat Kerja Sama Pemerintah">
                      Pengabdian bagi Masyarakat Kerja Sama Pemerintah
                    </option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label>Judul Kerjasama (PKS)*</label>
                <input
                  type="text"
                  name="judul"
                  data-section="content"
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Judul lengkap dokumen PKS"
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
                  Email notifikasi akan dikirim pada tanggal ini.
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
