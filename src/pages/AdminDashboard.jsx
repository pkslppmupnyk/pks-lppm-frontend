// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import pksService from "../services/pksService";
import PksCard from "../components/PksCard"; // <-- Kembali menggunakan PksCard yang ringkas

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPks();
  }, [activeTab]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dasbor Perjanjian Kerja Sama
      </h1>

      {/* Tab Navigation */}
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

      {/* Content */}
      <div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pksList.length > 0 ? (
              pksList.map((pks) => <PksCard key={pks._id} pks={pks} />)
            ) : (
              <p className="col-span-full text-center py-8 text-gray-500">
                Tidak ada data PKS pada status ini.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
