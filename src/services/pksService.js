// src/services/pksService.js
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
// ----------------------------

const getPksByNomor = async (nomor) => {
  try {
    const response = await apiClient.get(`/pks/${nomor}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updatePks = async (nomor, updateData) => {
  try {
    const response = await apiClient.patch(`/pks/${nomor}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePks = async (nomor) => {
  try {
    const response = await apiClient.delete(`/pks/${nomor}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const downloadFile = async (nomor, docName) => {
  try {
    const response = await apiClient.get(`/pks/${nomor}/file`, {
      responseType: "blob", // Penting untuk menerima file
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", docName || `${nomor}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    throw error.response.data;
  }
};

const uploadPksFile = async (nomor, file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post(`/pks/${nomor}/file`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePksFile = async (nomor) => {
  try {
    const response = await apiClient.delete(`/pks/${nomor}/file`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const generateDocx = async (nomor) => {
  try {
    const response = await apiClient.get(`/pks/${nomor}/generate`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${nomor}.docx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    throw error.response.data;
  }
};

// ... (di dalam pksService.js)
const sendEmail = async (pksId) => {
  try {
    // Endpoint ini belum ada di dokumentasi Anda, pastikan Anda membuatnya di backend
    const response = await apiClient.post(`/pks/id/${pksId}/send-email`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const pksService = {
  getAllPks,
  createPks,
  getPksByNomor, // <-- Daftarkan
  updatePks, // <-- Daftarkan
  downloadFile, // <-- Daftarkan
  generateDocx,
  deletePks,
  sendEmail,
  uploadPksFile,
  deletePksFile, // <-- Daftarkan
};

export default pksService;
