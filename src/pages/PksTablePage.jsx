import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
} from "lucide-react";
import pksService from "../services/pksService";

const PksTablePage = () => {
  // --- 1. State Management ---
  const [pksData, setPksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- 2. Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // REVISI: Menggunakan getAllPks (sesuai export di pksService.js)
        // Sebelumnya: pksService.getAllPksAdmin() -> Function not found
        const response = await pksService.getAllPks();

        // DEBUGGING: Cek hasil data di console browser
        console.log("Data PKS Fetched:", response);

        // Backend mengirim format { data: [...], pagination: {...} }
        // pksService mengembalikan response.data dari axios,
        // jadi disini kita ambil properti .data dari object return backend
        setPksData(response.data || []);
      } catch (err) {
        console.error("Error fetching PKS data:", err);
        setError("Gagal memuat data PKS. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 3. Logic Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pksData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pksData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLimitChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset ke halaman 1 saat limit berubah
  };

  // --- 4. Helper Functions (Formatting & UI) ---

  // Format Tanggal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Badge Status Warna
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "";

    let styles = "bg-gray-100 text-gray-800"; // Default
    let label = status || "Draft";

    if (
      statusLower.includes("wait") ||
      statusLower.includes("tunggu") ||
      statusLower.includes("pending") ||
      statusLower === "menunggu dokumen" ||
      statusLower === "menunggu review"
    ) {
      styles = "bg-yellow-100 text-yellow-800 border border-yellow-200";
      // Format label agar lebih rapi (Capitalize)
      label =
        statusLower === "menunggu dokumen"
          ? "Menunggu Dokumen"
          : "Menunggu Review";
    } else if (
      statusLower.includes("act") ||
      statusLower.includes("setuju") ||
      statusLower.includes("approve")
    ) {
      styles = "bg-green-100 text-green-800 border border-green-200";
      label = "Approved";
    } else if (
      statusLower.includes("tolak") ||
      statusLower.includes("reject")
    ) {
      styles = "bg-red-100 text-red-800 border border-red-200";
      label = "Rejected";
    }

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles}`}
      >
        {label}
      </span>
    );
  };

  // --- 5. Render Component ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Manajemen Data PKS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola seluruh dokumen kerjasama dalam satu tabel.
          </p>
        </div>

        {/* Limit Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm text-gray-600">Tampilkan:</span>
          <select
            value={itemsPerPage}
            onChange={handleLimitChange}
            className="text-sm font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <span className="text-sm text-gray-600">baris</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16 text-center">
                  No
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Judul PKS
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mitra
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tgl Mulai
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-32">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton Loading State
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                // Data Loop
                currentItems.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="hover:bg-blue-50/50 transition-colors odd:bg-white even:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 text-center font-medium">
                      {indexOfFirstItem + index + 1}
                    </td>

                    {/* REVISI: Akses ke nested object 'content' */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {item.content?.judul || "Tanpa Judul"}
                      <div className="text-xs text-gray-400 font-normal mt-0.5">
                        {item.content?.nomor || "-"}
                      </div>
                    </td>

                    {/* REVISI: Akses ke nested object 'pihakKedua' */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.pihakKedua?.instansi || "-"}
                    </td>

                    {/* REVISI: Akses ke Array 'bentukKerjaSama' & join jika lebih dari 1 */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.content?.bentukKerjaSama?.join(", ") || "-"}
                    </td>

                    {/* REVISI: Akses ke 'content.tanggal' */}
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(item.content?.tanggal)}
                    </td>

                    {/* REVISI: Akses ke 'properties.status' */}
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(item.properties?.status)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/pks/${item._id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors tooltip"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/pks/${item._id}/edit`}
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"
                          title="Edit Data"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 opacity-20" />
                      <p>Belum ada data PKS yang tersedia.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Controls */}
        {!loading && pksData.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-600">
              Menampilkan{" "}
              <span className="font-semibold text-gray-900">
                {indexOfFirstItem + 1}
              </span>{" "}
              sampai{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(indexOfLastItem, pksData.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-900">
                {pksData.length}
              </span>{" "}
              data
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Simple Number Pagination */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PksTablePage;
