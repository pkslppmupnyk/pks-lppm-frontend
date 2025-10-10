// src/services/authService.js
import apiClient from "./apiClient";

const register = async (userData) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const login = async (username, password) => {
  try {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    if (response.data && response.data.data.token) {
      localStorage.setItem("authToken", response.data.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const logout = () => {
  localStorage.removeItem("authToken");
};

const getProfile = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;
