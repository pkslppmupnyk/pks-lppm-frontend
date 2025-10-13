import React from "react";
import { Link } from "react-router-dom";
import PdfViewer from "../components/PdfViewer";

export default function PanduanPage() {
  const fileUrl = "/panduan.pdf";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dokumen Panduan</h1>
          <a
            href={fileUrl}
            download="Panduan Pengajuan PKS LPPM UPNYK.pdf"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Unduh Panduan
          </a>
        </div>
        <PdfViewer fileUrl={fileUrl} />
        <div className="mt-4 text-center">
          <Link to="/" className="text-green-600 hover:text-green-800">
            &larr; Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
