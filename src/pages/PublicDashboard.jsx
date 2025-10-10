import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import pksService from "../services/pksService";

// Komponen StatusBadge tidak berubah
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
      className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
    >
      {statusInfo.text}
    </span>
  );
};

// Komponen TableRow diperbarui dengan umpan balik visual
const TableRow = ({ pks }) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-normal break-words">
        {pks.content?.judul || "-"}
      </td>
      <td className="py-3 px-4 font-mono text-sm whitespace-normal break-words">
        {" "}
        {/* Ditambahkan break-words */}
        {pks.content?.nomor || "-"}
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        {pks.pihakKedua?.instansi || "-"}
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        {pks.content?.tanggal
          ? new Date(pks.content.tanggal).toLocaleDateString("id-ID")
          : "-"}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={pks.properties?.status} />
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-center">
        {pks.content?.nomor ? (
          <Link
            to={`/track/${encodeURIComponent(pks.content.nomor)}`} // Gunakan encodeURIComponent
            className="bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Detail
          </Link>
        ) : (
          <span
            className="text-gray-400 text-xs italic cursor-not-allowed"
            title="Detail tidak tersedia karena Nomor PKS tidak ada"
          >
            N/A
          </span>
        )}
      </td>
    </tr>
  );
};

export default function PublicDashboard() {
  const [pksList, setPksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPks = async () => {
      try {
        setLoading(true);
        const response = await pksService.getAllPks({ limit: 200 });
        setPksList(response.data || []);
      } catch (err) {
        setError("Gagal memuat data PKS. Coba muat ulang halaman.");
      } finally {
        setLoading(false);
      }
    };
    fetchPks();
  }, []);

  const filteredPks = useMemo(() => {
    if (!searchTerm) return pksList;
    const lowercasedTerm = searchTerm.toLowerCase();
    return pksList.filter(
      (pks) =>
        pks.content?.judul?.toLowerCase().includes(lowercasedTerm) ||
        pks.content?.nomor?.toLowerCase().includes(lowercasedTerm) ||
        pks.pihakKedua?.instansi?.toLowerCase().includes(lowercasedTerm) ||
        pks.properties?.status?.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, pksList]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="w-full md:flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan judul, nomor PKS, institusi..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <Link
            to="/submit-pks"
            className="w-full md:w-auto text-center bg-green-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-800 transition-colors whitespace-nowrap"
          >
            Buat PKS Baru
          </Link>
        </div>

        {loading && <p className="text-center py-4">Memuat data...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white table-fixed w-full">
              <thead className="bg-gray-100">
                <tr>
                  {/* --- LEBAR KOLOM DISESUAIKAN DI SINI --- */}
                  <th className="w-[25%] py-3 px-4 text-left font-semibold text-gray-600">
                    Judul
                  </th>
                  <th className="w-[25%] py-3 px-4 text-left font-semibold text-gray-600">
                    Nomor PKS
                  </th>
                  <th className="w-[15%] py-3 px-4 text-left font-semibold text-gray-600">
                    Pihak Kedua
                  </th>
                  <th className="w-[10%] py-3 px-4 text-left font-semibold text-gray-600">
                    Tanggal
                  </th>
                  <th className="w-[15%] py-3 px-4 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="w-[10%] py-3 px-4 text-left font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPks.length > 0 ? (
                  filteredPks.map((pks) => <TableRow key={pks._id} pks={pks} />)
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      Tidak ada data yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
