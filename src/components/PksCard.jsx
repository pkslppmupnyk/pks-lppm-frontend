// src/components/PksCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PksCard({ pks }) {
  const statusColors = {
    draft: "bg-gray-200 text-gray-800",
    "menunggu dokumen": "bg-yellow-200 text-yellow-800",
    "menunggu review": "bg-blue-200 text-blue-800",
    approved: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
  };

  const formattedDate = pks?.content?.tanggal
    ? new Date(pks.content.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  const displayNomor =
    pks?.content?.nomor?.replace(/-/g, "/") || "Tidak ada nomor";

  // Cek apakah ada MoU
  const hasMoU = pks?.mou?.hasMoU;

  return (
    <Link to={`/admin/pks/${pks?._id}`} className="block h-full">
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-200 h-full flex flex-col relative">
        {/* Indikator MoU (Pojok Kiri Atas jika diperlukan, atau di bawah judul) */}

        <div className="flex justify-between items-start mb-2 gap-2">
          <h3
            className="font-bold text-gray-800 flex-1 line-clamp-2"
            title={pks?.content?.judul}
          >
            {pks?.content?.judul || "Tanpa Judul"}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap flex-shrink-0 ${
              statusColors[pks?.properties?.status] || "bg-gray-200"
            }`}
          >
            {pks?.properties?.status || "unknown"}
          </span>
        </div>

        {/* Baris Indikator MoU */}
        {hasMoU && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Ada MoU
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-1 line-clamp-1">
          <span className="font-semibold">Instansi:</span>{" "}
          {pks?.pihakKedua?.instansi || "-"}
        </p>
        <p className="text-sm text-gray-600 mb-1 capitalize">
          <span className="font-semibold">Cakupan:</span>{" "}
          {pks?.properties?.cakupanKerjaSama || "-"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Nomor:</span> {displayNomor}
        </p>
        <div className="flex-grow"></div>
        <p className="mt-4 text-xs text-gray-400 self-end">{formattedDate}</p>
      </div>
    </Link>
  );
}
