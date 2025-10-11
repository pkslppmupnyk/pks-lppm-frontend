import apiClient from "./apiClient";

const getAllPks = async (params) => {
  try {
    const response = await apiClient.get("/pks", { params });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// --- TAMBAHKAN FUNGSI INI ---
const createPks = async (pksData) => {
  try {
    const response = await apiClient.post("/pks", pksData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getPksByNomor = async (nomor) => {
  try {
    const response = await apiClient.get(`/pks/${encodeURIComponent(nomor)}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updatePks = async (nomor, updateData) => {
  try {
    const response = await apiClient.patch(
      `/pks/${encodeURIComponent(nomor)}`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const submitForReview = async (nomor) => {
  try {
    const response = await apiClient.post(
      `/pks/${encodeURIComponent(nomor)}/submit-review`
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePks = async (nomor) => {
  try {
    const response = await apiClient.delete(
      `/pks/${encodeURIComponent(nomor)}`
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePksFile = async (nomor) => {
  try {
    const response = await apiClient.delete(
      `/pks/${encodeURIComponent(nomor)}/file`
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const downloadFile = async (nomor, docName) => {
  try {
    const response = await apiClient.get(
      `/pks/${encodeURIComponent(nomor)}/file`,
      {
        responseType: "blob",
      }
    );
    // ... (sisa fungsi tidak berubah)
  } catch (error) {
    throw error.response.data;
  }
};

const uploadPksFile = async (nomor, file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post(
      `/pks/${encodeURIComponent(nomor)}/file`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const generateDocx = async (nomor) => {
  try {
    const response = await apiClient.get(
      `/pks/${encodeURIComponent(nomor)}/generate`,
      {
        responseType: "blob",
      }
    );
    // ... (sisa fungsi tidak berubah)
  } catch (error) {
    throw error.response.data;
  }
};

const sendNotification = async (nomor) => {
  try {
    const response = await apiClient.post(
      `/pks/${encodeURIComponent(nomor)}/send-notification`
    );
    return response.data;
  } catch (error) {
    // Kita tidak melempar error agar tidak mengganggu UI jika email gagal
    console.error("Failed to send notification email:", error);
  }
};

const pksService = {
  getAllPks,
  createPks,
  getPksByNomor, // <-- Daftarkan
  updatePks,
  submitForReview, // <-- Daftarkan
  downloadFile, // <-- Daftarkan
  generateDocx,
  deletePks,
  sendNotification,
  uploadPksFile,
  deletePksFile, // <-- Daftarkan
};

export default pksService;
