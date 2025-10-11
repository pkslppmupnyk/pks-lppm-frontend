import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import pksService from "../services/pksService";

// Komponen helper untuk menampilkan baris data detail
const DetailRow = ({ label, value }) => (
  <div className="py-2">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-md text-gray-900">{value || "-"}</dd>
  </div>
);

// Komponen helper untuk badge status
const StatusBadge = ({ status }) => {
  const statusMap = {
    draft: { text: "Draft", className: "bg-gray-200 text-gray-800" },
    "menunggu dokumen": {
      text: "Menunggu Dokumen",
      className: "bg-yellow-200 text-yellow-800",
    },
    "menunggu review": {
      text: "Review",
      className: "bg-blue-200 text-blue-800",
    },
    approved: { text: "Disetujui", className: "bg-green-200 text-green-800" },
    rejected: { text: "Ditolak", className: "bg-red-200 text-red-800" },
  };
  const statusInfo = statusMap[status] || statusMap.draft;
  return (
    <span
      className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.className}`}
    >
      {statusInfo.text}
    </span>
  );
};

export default function PksTrackingPage() {
  const { nomor } = useParams();
  const [pks, setPks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const fetchPks = useCallback(async () => {
    if (!nomor) return;
    try {
      setLoading(true);
      const response = await pksService.getPksByNomor(nomor);
      setPks(response);
    } catch (err) {
      setError("Gagal mengambil data PKS atau data tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }, [nomor]);

  useEffect(() => {
    fetchPks();
  }, [fetchPks]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadMessage("");
    try {
      await pksService.uploadPksFile(nomor, selectedFile);
      await pksService.submitForReview(nomor);
      setUploadMessage(
        "File berhasil diunggah dan PKS telah dikirim untuk direview!"
      );
      fetchPks();
    } catch (err) {
      setUploadMessage(
        "Gagal: " + (err.message || "Terjadi kesalahan. Coba lagi nanti.")
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="text-center p-8">Memuat detail PKS...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!pks)
    return (
      <div className="text-center p-8 text-gray-500">
        Data PKS tidak ditemukan.
      </div>
    );

  const {
    content = {},
    pihakKedua = {},
    properties = {},
    fileUpload = {},
  } = pks;

  const displayNomor = content.nomor ? content.nomor.replace(/-/g, "/") : "-";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/"
        className="text-green-600 hover:text-green-800 mb-6 inline-block"
      >
        &larr; Kembali ke Daftar PKS
      </Link>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{content?.judul}</h1>
          <p className="text-gray-500 font-mono">{displayNomor}</p>
          <div className="mt-2">
            <StatusBadge status={properties?.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <dl>
              <DetailRow
                label="Komentar Terakhir dari Admin"
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
            <h3 className="font-semibold text-lg border-b pb-2">
              Aksi yang Tersedia
            </h3>
            <button
              onClick={() => pksService.generateDocx(content.nomor)}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Dokumen (.docx)
            </button>
            {fileUpload?.fileName ? (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  File Tersimpan:
                </h4>
                <div className="flex items-center bg-gray-50 p-2 rounded-md">
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
                  onClick={() =>
                    pksService.downloadFile(content.nomor, fileUpload.docName)
                  }
                  className="mt-2 w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Unduh Lampiran
                </button>
              </div>
            ) : (
              <div className="p-2 text-center bg-gray-100 text-gray-500 rounded-md text-sm">
                Lampiran belum tersedia.
              </div>
            )}

            {properties.status === "menunggu dokumen" && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg">
                  Upload Dokumen Lampiran
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Silakan unggah dokumen yang diperlukan (hanya .pdf).
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="mt-2 w-full px-4 py-2 font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400"
                >
                  {uploading ? "Mengunggah..." : "Upload & Kirim untuk Review"}
                </button>
                {uploadMessage && (
                  <p
                    className={`text-sm mt-2 text-center ${
                      uploadMessage.includes("Gagal")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {uploadMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
