import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import pksService from "../services/pksService";

// Komponen StatusBadge
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

// Komponen TableRow
const TableRow = ({ pks }) => {
  const displayNomor = pks.content?.nomor?.replace(/-/g, "/") || "-";

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-4 px-4 sm:px-6 text-sm">{pks.content?.judul || "-"}</td>
      <td className="py-4 px-4 sm:px-6 font-mono text-sm">{displayNomor}</td>
      <td className="py-4 px-4 sm:px-6 text-sm">
        {pks.pihakKedua?.instansi || "-"}
      </td>
      <td className="py-4 px-4 sm:px-6 text-sm capitalize">
        {pks.properties?.cakupanKerjaSama || "-"}
      </td>
      <td className="py-4 px-2 sm:px-6 text-center">
        <StatusBadge status={pks.properties?.status} />
      </td>
      <td className="py-4 px-2 sm:px-6 text-center">
        <Link
          to={`/track/${pks._id}`}
          className="bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-green-700"
        >
          Detail
        </Link>
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
        console.error(err);
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
        pks.properties?.status?.toLowerCase().includes(lowercasedTerm) ||
        pks.properties?.cakupanKerjaSama?.toLowerCase().includes(lowercasedTerm)
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
              placeholder="Cari PKS..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="flex gap-2">
            <Link
              to="/panduan"
              className="w-full md:w-auto text-center bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600"
            >
              Panduan
            </Link>
            <Link
              to="/submit-pks"
              className="w-full md:w-auto text-center bg-green-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-800"
            >
              Buat PKS Baru
            </Link>
          </div>
        </div>

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-[30%] py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Judul
                  </th>
                  <th className="w-[20%] py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Nomor PKS
                  </th>
                  <th className="w-[20%] py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Pihak Kedua
                  </th>
                  <th className="w-[15%] py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Cakupan
                  </th>
                  <th className="w-[10%] py-4 px-4 sm:px-6 text-center font-semibold text-gray-600 text-sm">
                    Status
                  </th>
                  <th className="w-[5%] py-4 px-4 sm:px-6 text-center font-semibold text-gray-600 text-sm">
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
                      Tidak ada data.
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
