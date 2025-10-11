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

const createPks = async (pksData) => {
  try {
    const response = await apiClient.post("/pks", pksData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getPksById = async (id) => {
  try {
    const response = await apiClient.get(`/pks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updatePks = async (id, updateData) => {
  try {
    const response = await apiClient.patch(`/pks/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePks = async (id) => {
  try {
    const response = await apiClient.delete(`/pks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePksFile = async (id) => {
  try {
    const response = await apiClient.delete(`/pks/${id}/file`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const downloadFile = async (id, docName) => {
  try {
    const response = await apiClient.get(`/pks/${id}/file`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", docName || `${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    throw error.response.data;
  }
};

const uploadPksFile = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await apiClient.post(`/pks/${id}/file`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const generateDocx = async (id, nomorPks) => {
  try {
    const response = await apiClient.get(`/pks/${id}/generate`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    // Gunakan nomorPks untuk nama file agar lebih informatif
    const fileName = nomorPks
      ? `${nomorPks.replace(/-/g, "/")}.docx`
      : `${id}.docx`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    throw error.response.data;
  }
};

const sendNotification = async (id) => {
  try {
    // Backend route diubah menjadi /pks/:id/status-notification
    const response = await apiClient.post(`/pks/${id}/status-notification`);
    return response.data;
  } catch (error) {
    console.error("Failed to send notification email:", error);
    // Tidak melempar error agar tidak menghentikan flow utama jika email gagal
  }
};

const submitForReview = async (id) => {
  try {
    const response = await apiClient.post(`/pks/${id}/submit-review`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const pksService = {
  getAllPks,
  createPks,
  getPksById,
  updatePks,
  submitForReview,
  downloadFile,
  generateDocx,
  deletePks,
  sendNotification,
  uploadPksFile,
  deletePksFile,
};

export default pksService;
