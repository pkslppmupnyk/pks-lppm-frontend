// src/components/PksDetailCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 py-1">
    <dt className="text-sm font-medium text-gray-500 col-span-1">{label}</dt>
    <dd className="mt-0 text-sm text-gray-900 col-span-2">{value || "-"}</dd>
  </div>
);

export default function PksDetailCard({ pks }) {
  const statusColors = {
    draft: "bg-gray-200 text-gray-800",
    "menunggu dokumen": "bg-yellow-200 text-yellow-800",
    "menunggu review": "bg-blue-200 text-blue-800",
    approved: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-800 pr-2 flex-1">
          {pks?.content?.judul || "Tanpa Judul"}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${
            statusColors[pks?.properties?.status] || "bg-gray-200"
          }`}
        >
          {pks?.properties?.status || "unknown"}
        </span>
      </div>

      <dl className="space-y-1 text-sm">
        <DetailRow label="Nomor PKS" value={pks?.content?.nomor} />
        <DetailRow label="Instansi" value={pks?.pihakKedua?.instansi} />
        <DetailRow label="Penanggung Jawab" value={pks?.pihakKedua?.nama} />
        <DetailRow
          label="Tanggal Berlaku"
          value={
            pks?.content?.tanggal
              ? new Date(pks.content.tanggal).toLocaleDateString("id-ID")
              : "-"
          }
        />
        <DetailRow
          label="Tanggal Kadaluarsa"
          value={
            pks?.content?.tanggalKadaluarsa
              ? new Date(pks.content.tanggalKadaluarsa).toLocaleDateString(
                  "id-ID"
                )
              : "-"
          }
        />
        <DetailRow label="Komentar" value={pks?.properties?.comment} />
      </dl>

      <div className="flex-grow mt-4"></div>

      <Link
        to={`/admin/pks/${pks?.content?.nomor}`}
        className="mt-4 self-end text-center w-full max-w-xs mx-auto px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Lihat Detail & Aksi
      </Link>
    </div>
  );
}
