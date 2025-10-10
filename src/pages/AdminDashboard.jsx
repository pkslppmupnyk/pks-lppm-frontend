// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import pksService from "../services/pksService";
import PksDetailCard from "../components/PksDetailCard"; // <-- Gunakan kartu baru
import PdfViewer from "../components/PdfViewer";
import { API_URL } from "../services/apiClient"; // Pastikan apiClient mengekspor API_URL

const TABS = [
  "draft",
  "menunggu dokumen",
  "menunggu review",
  "approved",
  "rejected",
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [pksList, setPksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await pksService.getAllPks({
          status: activeTab,
          limit: 100,
        });
        setPksList(response.data);
      } catch (err) {
        setError("Gagal memuat data PKS.");
      } finally {
        setLoading(false);
      }
    };
    fetchPks();
  }, [activeTab]);

  const renderContent = () => {
    if (loading) return <p className="text-center p-8">Loading...</p>;
    if (error) return <p className="text-center p-8 text-red-500">{error}</p>;
    if (pksList.length === 0) {
      return (
        <p className="col-span-full text-center p-8 text-gray-500">
          Tidak ada data PKS pada status ini.
        </p>
      );
    }

    // Tampilan khusus untuk "Menunggu Review"
    if (activeTab === "menunggu review") {
      return (
        <div className="space-y-8">
          {pksList.map((pks) => {
            const pdfUrl = pks.fileUpload?.fileName
              ? `${API_URL}/pks/${pks.content.nomor}/file`
              : null;

            return (
              <div
                key={pks._id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
              >
                <PksDetailCard pks={pks} />
                {pdfUrl ? (
                  <PdfViewer fileUrl={pdfUrl} />
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      PDF tidak ditemukan, tidak bisa tertampil.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Tampilan standar untuk tab lainnya
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pksList.map((pks) => (
          <PksDetailCard key={pks._id} pks={pks} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dasbor Perjanjian Kerja Sama
      </h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
}
