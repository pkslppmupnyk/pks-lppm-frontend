import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import pksService from "../services/pksService";
import Modal from "../components/Modal";

// Komponen helper untuk menampilkan baris data detail
const DetailRow = ({ label, value }) => (
  <div className="py-2">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-md text-gray-900">{value || "-"}</dd>
  </div>
);

// Opsi status yang valid
const STATUS_OPTIONS = [
  "draft",
  "menunggu dokumen",
  "menunggu review",
  "approved",
  "rejected",
];

export default function PksDetailPage() {
  const { nomor } = useParams();
  const navigate = useNavigate();
  const [pks, setPks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk modal status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // State untuk modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchPks = useCallback(async () => {
    if (!nomor) return;
    try {
      setLoading(true);
      const response = await pksService.getPksByNomor(nomor);
      setPks(response);
      setNewStatus(response.properties.status);
    } catch (err) {
      setError("Gagal mengambil data PKS.");
    } finally {
      setLoading(false);
    }
  }, [nomor]);

  useEffect(() => {
    fetchPks();
  }, [fetchPks]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError("");
    const payload = {
      properties: { status: newStatus, email: pks.properties.email },
    };
    if (comment.trim() !== "") {
      payload.properties.comment = comment;
    }
    try {
      await pksService.updatePks(nomor, payload);
      setIsModalOpen(false);
      fetchPks();
    } catch (err) {
      setUpdateError(err.message || "Gagal memperbarui status.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await pksService.deletePks(nomor);
      alert("PKS berhasil dihapus.");
      navigate("/admin/dashboard");
    } catch (err) {
      setDeleteError("Gagal menghapus PKS. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!pks) return null;

  const {
    content = {},
    pihakKedua = {},
    properties = {},
    fileUpload = {},
  } = pks;
  const handleDownload = () =>
    pksService.downloadFile(nomor, fileUpload?.docName);
  const handleGenerate = () => pksService.generateDocx(nomor);

  return (
    <div>
      <Link
        to="/admin/dashboard"
        className="text-sm text-blue-600 hover:underline mb-6 inline-block"
      >
        &larr; Kembali ke Dasbor
      </Link>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* ... (bagian detail PKS tidak berubah) ... */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{content?.judul}</h1>
          <p className="text-gray-500">{content?.nomor}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <dl>
              <DetailRow
                label="Status Saat Ini"
                value={properties?.status?.toUpperCase()}
              />
              <DetailRow
                label="Komentar Terakhir"
                value={properties?.comment}
              />
              <DetailRow
                label="Instansi Pihak Kedua"
                value={pihakKedua?.instansi}
              />
              <DetailRow
                label="Penanggung Jawab"
                value={`${pihakKedua?.nama || ""} (${
                  pihakKedua?.jabatan || ""
                })`}
              />
              <DetailRow label="Email Kontak" value={properties?.email} />
              <DetailRow
                label="Tanggal Berlaku"
                value={
                  content?.tanggal && content?.tanggalKadaluarsa
                    ? `${new Date(content.tanggal).toLocaleDateString(
                        "id-ID"
                      )} - ${new Date(
                        content.tanggalKadaluarsa
                      ).toLocaleDateString("id-ID")}`
                    : "-"
                }
              />
              <DetailRow label="Alamat" value={pihakKedua?.alamat} />
            </dl>
          </div>
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Aksi Utama</h3>
            <Link
              to={`/admin/pks/${nomor}/edit`}
              className="block text-center w-full px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Edit Data PKS
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Ubah Status
            </button>
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Generate Dokumen (.docx)
            </button>
            {fileUpload?.fileName && (
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Download Lampiran (.pdf)
              </button>
            )}
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg text-red-600">
                Zona Berbahaya
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="mt-2 w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-800"
              >
                Hapus PKS Ini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- KONTEN MODAL YANG BENAR ADA DI SINI --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ubah Status PKS"
      >
        <form onSubmit={handleStatusUpdate}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Status Baru
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Komentar (Opsional)
              </label>
              <textarea
                id="comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tambahkan catatan atau komentar..."
              ></textarea>
            </div>
            {updateError && (
              <p className="text-sm text-red-600">{updateError}</p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updateLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updateLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div>
          <p className="text-gray-700">
            Apakah Anda benar-benar yakin ingin menghapus PKS dengan nomor{" "}
            <strong>{nomor}</strong>? Tindakan ini tidak dapat diurungkan.
          </p>
          {deleteError && (
            <p className="mt-4 text-sm text-center text-red-600">
              {deleteError}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
