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
        setFormData(pksData);
        if (pksData.logoUpload?.fileName) {
          setLogoPreview(
            `${API_URL}/../uploads/logos/${pksData.logoUpload.fileName}`
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

    const payload = {
      content: formData.content,
      pihakKedua: formData.pihakKedua,
      properties: formData.properties,
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
                  value={formData.content.judul}
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
                  value={formData.properties.email}
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
                <small className="text-gray-500">
                  Mengubah cakupan akan mengubah nomor PKS.
                </small>
              </div>
            </div>
          </fieldset>
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
