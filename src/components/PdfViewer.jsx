// src/components/PdfViewer.jsx
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// Konfigurasi worker untuk react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div
      className="bg-gray-200 p-4 rounded-lg shadow-inner"
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="text-center p-4">Memuat PDF...</div>}
        error={
          <div className="text-center p-4 text-red-600">
            Gagal memuat PDF. Pastikan file valid.
          </div>
        }
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            width={800} // Anda bisa sesuaikan lebar viewer
            className="mb-4 shadow-md"
          />
        ))}
      </Document>
    </div>
  );
}
