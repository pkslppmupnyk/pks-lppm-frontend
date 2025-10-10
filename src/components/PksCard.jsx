// src/components/PksCard.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function PksCard({ pks }) {
  // Baris ini sengaja ada untuk diagnosis di console browser Anda.
  // Ini membantu Anda melihat data apa yang diterima oleh setiap kartu.
  console.log("Data yang diterima PksCard:", pks);

  const statusColors = {
    draft: "bg-gray-200 text-gray-800",
    "menunggu dokumen": "bg-yellow-200 text-yellow-800",
    "menunggu review": "bg-blue-200 text-blue-800",
    approved: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
  };

  // Mengambil tanggal dan memformatnya dengan aman
  const formattedDate = pks?.content?.tanggal
    ? new Date(pks.content.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    // Link dibuat dengan pengaman (optional chaining)
    <Link
      to={`/admin/pks/${encodeURIComponent(pks?.content?.nomor)}`}
      className="block h-full"
    >
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-200 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          {/* Judul PKS */}
          <h3 className="font-bold text-gray-800 pr-2 flex-1">
            {pks?.content?.judul || "Tanpa Judul"}
          </h3>
          {/* Status Badge */}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${
              statusColors[pks?.properties?.status] || "bg-gray-200"
            }`}
          >
            {pks?.properties?.status || "unknown"}
          </span>
        </div>

        {/* Instansi */}
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-semibold">Instansi:</span>{" "}
          {pks?.pihakKedua?.instansi || "-"}
        </p>

        {/* Nomor PKS */}
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Nomor:</span>{" "}
          {pks?.content?.nomor || "Tidak ada nomor"}
        </p>

        {/* Spacer untuk mendorong tanggal ke bawah */}
        <div className="flex-grow"></div>

        {/* Tanggal Pengajuan */}
        <p className="mt-4 text-xs text-gray-400 self-end">{formattedDate}</p>
      </div>
    </Link>
  );
}
