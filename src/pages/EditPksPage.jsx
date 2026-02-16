// src/pages/EditPksPage.jsx
import React, { useState, useEffect } from "react";
import pksService from "../services/pksService";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_URL } from "../services/apiClient";

export default function EditPksPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    const fetchPksData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const pksData = await pksService.getPksById(id);

        // NORMALISASI DATA:
        // 1. Pastikan object 'mou' ada
        if (!pksData.mou) {
          pksData.mou = {
            hasMoU: false,
            nomorUpn: "",
            nomorMitra: "",
            judul: "",
            tanggalMulai: "",
            tanggalSelesai: "",
          };
        }
        // 2. Pastikan bentukKerjaSama adalah array
        if (!Array.isArray(pksData.content.bentukKerjaSama)) {
          pksData.content.bentukKerjaSama = [];
        }

        setFormData(pksData);
        if (pksData.logoUpload?.fileName) {
          setLogoPreview(
            `${API_URL}/uploads/logos/${pksData.logoUpload.fileName}`,
          );
        }
      } catch (error) {
        setMessage({ type: "error", text: "Gagal memuat data PKS." });
      } finally {
        setLoading(false);
      }
    };
    fetchPksData();
  }, [id]);

  // Handler Umum
  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    const { section } = dataset;

    // Logic untuk checkbox vs text input
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: finalValue,
      },
    }));
  };

  // Handler Khusus Array Bentuk Kerja Sama (REVISI BARU)
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
          ? undefined // set undefined agar sesuai model
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
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setLogoLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await pksService.uploadLogo(id, logoFile);
      setMessage({ type: "success", text: "Logo berhasil diperbarui." });
      setLogoFile(null);
      setLogoPreview(`${API_URL}/uploads/logos/${response.data.fileName}`);
    } catch (error) {
      setMessage({ type: "error", text: "Gagal mengunggah logo." });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus logo ini?")) return;
    setLogoLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await pksService.deleteLogo(id);
      setMessage({ type: "success", text: "Logo berhasil dihapus." });
      setLogoPreview(null);
      setLogoFile(null);
    } catch (error) {
      setMessage({ type: "error", text: "Gagal menghapus logo." });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: "", text: "" });

    // Validasi MoU
    if (formData.mou.hasMoU) {
      if (
        !formData.mou.nomorUpn ||
        !formData.mou.nomorMitra ||
        !formData.mou.judul ||
        !formData.mou.tanggalMulai
      ) {
        setMessage({
          type: "error",
          text: "Data MoU wajib diisi lengkap jika opsi MoU dicentang.",
        });
        setSaveLoading(false);
        return;
      }
    }

    // Validasi Bentuk Kerja Sama (REVISI BARU)
    if (
      !formData.content.bentukKerjaSama ||
      formData.content.bentukKerjaSama.length === 0
    ) {
      setMessage({
        type: "error",
        text: "Pilih minimal satu Bentuk Kerja Sama.",
      });
      setSaveLoading(false);
      return;
    }

    // Validasi Jenis Pengabdian (REVISI BARU)
    if (
      formData.content.bentukKerjaSama.includes("Pengabdian Masyarakat") &&
      !formData.content.jenisPengabdian
    ) {
      setMessage({
        type: "error",
        text: "Jenis Pengabdian wajib dipilih jika Bentuk Kerja Sama mencakup Pengabdian Masyarakat.",
      });
      setSaveLoading(false);
      return;
    }

    const payload = {
      content: formData.content,
      pihakKedua: formData.pihakKedua,
      properties: formData.properties,
      mou: formData.mou,
    };

    try {
      await pksService.updatePks(id, payload);
      alert("Data PKS berhasil diperbarui!");
      navigate(`/admin/pks/${id}`);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menyimpan perubahan.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  if (loading)
    return <div className="text-center p-8">Memuat form edit...</div>;
  if (!formData)
    return (
      <div className="text-center p-8 text-red-500">
        {message.text || "Data tidak ditemukan."}
      </div>
    );

  const displayNomor = formData.content.nomor
    ? formData.content.nomor.replace(/-/g, "/")
    : "-";

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Edit Perjanjian Kerja Sama
          </h2>
          <p className="text-gray-500">{displayNomor}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- BAGIAN 1: MOU --- */}
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
                  checked={formData.mou?.hasMoU || false}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700 font-medium">
                  PKS ini memiliki dasar MoU Induk
                </span>
              </label>
            </div>

            {formData.mou?.hasMoU && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label>Nomor MoU (UPN)*</label>
                  <input
                    type="text"
                    name="nomorUpn"
                    value={formData.mou.nomorUpn || ""}
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>Nomor MoU (Mitra)*</label>
                  <input
                    type="text"
                    name="nomorMitra"
                    value={formData.mou.nomorMitra || ""}
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label>Judul MoU*</label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.mou.judul || ""}
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>Tanggal Mulai MoU*</label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.mou.tanggalMulai?.substring(0, 10) || ""}
                    data-section="mou"
                    onChange={handleChange}
                    required={formData.mou.hasMoU}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>Tanggal Selesai MoU</label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formData.mou.tanggalSelesai?.substring(0, 10) || ""}
                    data-section="mou"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </fieldset>

          {/* --- BAGIAN 2: PKS (REVISI UTAMA DI SINI) --- */}
          <fieldset className="p-4 border rounded-md">
            <legend className="px-2 font-semibold text-lg text-gray-700">
              Detail Perjanjian (PKS)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- 1. Judul Kerjasama --- */}
              <div className="md:col-span-2">
                <label>Judul Kerjasama*</label>
                <input
                  type="text"
                  name="judul"
                  value={formData.content.judul}
                  data-section="content"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* --- 2. Bentuk Kerja Sama (Checkbox Array) - BARU --- */}
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Bentuk Kerja Sama*
                </label>
                <div className="flex gap-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value="Penelitian"
                      checked={formData.content.bentukKerjaSama?.includes(
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
                      checked={formData.content.bentukKerjaSama?.includes(
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

              {/* --- 3. Jenis Pengabdian (Conditional) - BARU --- */}
              {formData.content.bentukKerjaSama?.includes(
                "Pengabdian Masyarakat",
              ) && (
                <div className="md:col-span-2 animate-fade-in-down">
                  <label className="block mb-1 font-medium text-gray-700">
                    Jenis Pengabdian*
                  </label>
                  <select
                    name="jenisPengabdian"
                    data-section="content"
                    value={formData.content.jenisPengabdian || ""}
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

              {/* --- 4. Potensi Hak Cipta (Checkbox) - BARU --- */}
              <div className="md:col-span-2 bg-yellow-50 p-3 rounded border border-yellow-200">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasHakCipta"
                    data-section="content"
                    checked={formData.content.hasHakCipta || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-800 font-medium">
                    Apakah dokumen kerjasama ini memiliki potensi Hak Cipta?
                  </span>
                </label>
              </div>

              {/* --- Sisa Field Standard --- */}
              <div>
                <label>Email Pemberitahuan*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.properties.email}
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
                  value={formData.properties.telepon || ""}
                  data-section="properties"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label>Tanggal Mulai*</label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.content.tanggal?.substring(0, 10)}
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
                  value={formData.content.tanggalKadaluarsa?.substring(0, 10)}
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
                  value={formData.properties.cakupanKerjaSama}
                  data-section="properties"
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="dalam negeri">Dalam Negeri</option>
                  <option value="luar negeri">Luar Negeri</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* --- BAGIAN 3: PIHAK KEDUA & LOGO (Tetap Sama) --- */}
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
                  value={formData.pihakKedua.instansi}
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
                  value={formData.pihakKedua.nomor}
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
                  value={formData.pihakKedua.nama}
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
                  value={formData.pihakKedua.jabatan}
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
                  value={formData.pihakKedua.alamat}
                  data-section="pihakKedua"
                  onChange={handleChange}
                  required
                  className={inputClass}
                ></textarea>
              </div>
            </div>
          </fieldset>

          <fieldset className="p-4 border rounded-md">
            <legend className="px-2 font-semibold text-lg text-gray-700">
              Logo Instansi Pihak Kedua
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <input
                  type="file"
                  name="logo"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={!logoFile || logoLoading}
                    className="px-4 py-1 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {logoLoading ? "Menyimpan..." : "Simpan Logo"}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleLogoDelete}
                      disabled={logoLoading}
                      className="px-4 py-1 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Hapus Logo
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-center items-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview Logo"
                    className="max-h-24 border rounded-md p-2"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">Tidak ada logo</div>
                )}
              </div>
            </div>
          </fieldset>

          {message.text && (
            <div
              className={`p-4 rounded-md text-center ${
                message.type === "error" ? "bg-red-100 text-red-800" : ""
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex items-center justify-end gap-4">
            <Link
              to={`/admin/pks/${id}`}
              className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
