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

// Opsi status yang valid untuk modal darurat
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

  // State untuk modal revisi/tolak
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    newStatus: "",
    commentPrefix: "",
    commentRequired: false,
  });
  const [comment, setComment] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // State untuk modal status darurat
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

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
      setNewStatus(response.properties.status); // Untuk modal darurat
    } catch (err) {
      setError("Gagal mengambil data PKS.");
    } finally {
      setLoading(false);
    }
  }, [nomor]);

  useEffect(() => {
    fetchPks();
  }, [fetchPks]);

  // Fungsi untuk membuka modal komentar (revisi/tolak)
  const openCommentModal = (config) => {
    setModalContent(config);
    setComment("");
    setUpdateError("");
    setIsCommentModalOpen(true);
  };

  // Fungsi generik untuk update status
  const handleStatusUpdate = async (status, commentText) => {
    setUpdateLoading(true);
    setUpdateError("");
    const payload = {
      properties: {
        status: status,
        email: pks.properties.email,
        comment:
          commentText !== undefined
            ? commentText.trim()
            : pks.properties.comment,
      },
    };

    try {
      await pksService.updatePks(nomor, payload);
      setIsCommentModalOpen(false);
      setIsEmergencyModalOpen(false);
      fetchPks();
    } catch (err) {
      setUpdateError(err.message || "Gagal memperbarui status.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handler untuk form di dalam modal komentar
  const handleCommentModalSubmit = (e) => {
    e.preventDefault();
    if (modalContent.commentRequired && !comment.trim()) {
      setUpdateError("Komentar wajib diisi untuk tindakan ini.");
      return;
    }
    const fullComment = modalContent.commentPrefix
      ? `${modalContent.commentPrefix}${comment}`
      : comment;
    handleStatusUpdate(modalContent.newStatus, fullComment);
  };

  // Handler untuk modal darurat
  const handleEmergencyStatusUpdate = (e) => {
    e.preventDefault();
    handleStatusUpdate(newStatus, comment);
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

  // Fungsi untuk merender tombol aksi utama berdasarkan status
  const renderActionButtons = () => {
    const status = pks?.properties?.status;

    switch (status) {
      case "draft":
        return (
          <>
            <Link
              to={`/admin/pks/${nomor}/edit`}
              className="block text-center w-full px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Edit Data PKS
            </Link>
            <button
              onClick={() =>
                handleStatusUpdate(
                  "menunggu dokumen",
                  "Draft disetujui, menunggu unggah dokumen."
                )
              }
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Setujui Draft
            </button>
            <button
              onClick={() =>
                openCommentModal({
                  title: "Revisi Draft",
                  newStatus: "draft",
                  commentPrefix: "Draft perlu direvisi: ",
                  commentRequired: true,
                })
              }
              className="w-full px-4 py-2 font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
            >
              Minta Revisi
            </button>
            <button
              onClick={() =>
                openCommentModal({
                  title: "Tolak Draft",
                  newStatus: "rejected",
                  commentPrefix: "Draft ditolak: ",
                  commentRequired: true,
                })
              }
              className="w-full px-4 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Tolak Draft
            </button>
          </>
        );
      case "menunggu dokumen":
        return (
          <button
            onClick={() =>
              handleStatusUpdate("draft", "Dikembalikan ke draft oleh admin.")
            }
            className="w-full px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Kembalikan ke Draft
          </button>
        );
      case "menunggu review":
        return (
          <>
            <button
              onClick={() =>
                handleStatusUpdate("approved", "PKS telah disetujui.")
              }
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Setujui PKS
            </button>
            <button
              onClick={() =>
                openCommentModal({
                  title: "Revisi Dokumen Unggahan",
                  newStatus: "menunggu dokumen",
                  commentPrefix: "upload file ditolak: ",
                  commentRequired: true,
                })
              }
              className="w-full px-4 py-2 font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
            >
              Kembalikan ke Menunggu Dokumen
            </button>
          </>
        );
      default:
        return (
          <div className="p-3 text-center bg-gray-100 text-gray-600 rounded-md text-sm">
            Tidak ada aksi status yang tersedia.
          </div>
        );
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
            {renderActionButtons()}

            <h3 className="font-semibold text-lg border-b pb-2 pt-4">
              Aksi Dokumen
            </h3>
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Generate Dokumen (.docx)
            </button>

            {/* --- BLOK BARU DITAMBAHKAN DI SINI --- */}
            {fileUpload?.fileName && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  File Tersimpan:
                </h4>
                <div className="flex items-center bg-gray-50 p-2 rounded-md">
                  {/* SVG Icon untuk file */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-800 truncate">
                    {fileUpload.docName}
                  </span>
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-2 w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Unduh Lampiran
                </button>
              </div>
            )}
            {/* --- AKHIR BLOK BARU --- */}

            <div className="pt-4 border-t mt-6">
              <h3 className="font-semibold text-lg text-red-600">
                Zona Berbahaya
              </h3>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="mt-2 w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Ubah Status (Manual)
              </button>
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

      {/* ... (semua kode Modal tidak berubah) ... */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title={modalContent.title}
      >
        <form onSubmit={handleCommentModalSubmit}>
          <p className="text-sm text-gray-600 mb-4">
            {modalContent.commentRequired
              ? "Anda wajib memberikan alasan atau komentar untuk tindakan ini."
              : "Anda bisa menambahkan komentar (opsional)."}
          </p>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tuliskan komentar Anda di sini..."
            required={modalContent.commentRequired}
          ></textarea>
          {updateError && (
            <p className="text-sm text-red-600 mt-2">{updateError}</p>
          )}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updateLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updateLoading ? "Menyimpan..." : "Kirim"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Ubah Status PKS (Manual)"
      >
        <form onSubmit={handleEmergencyStatusUpdate}>
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
                htmlFor="emergency-comment"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Komentar (Opsional)
              </label>
              <textarea
                id="emergency-comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tambahkan catatan..."
              ></textarea>
            </div>
            {updateError && (
              <p className="text-sm text-red-600">{updateError}</p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
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
