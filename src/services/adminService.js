import apiClient from "./apiClient";

export const adminService = {
  // Ambil Tahun Aktif
  getActiveYear: async () => {
    const response = await apiClient.get("/admin/config/year");
    return response.data;
  },

  // Update Tahun Aktif
  updateActiveYear: async (year) => {
    const response = await apiClient.put("/admin/config/year", { year });
    return response.data;
  },

  // Ambil Nomor Urut Terakhir
  getLastSequence: async () => {
    const response = await apiClient.get("/admin/config/sequence");
    return response.data;
  },

  // Update Nomor Urut (Reset/Set Manual)
  updateLastSequence: async (seq) => {
    const response = await apiClient.put("/admin/config/sequence", { seq });
    return response.data;
  },
};
