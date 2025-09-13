import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://astrape-ecommerce-y090.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Add JWT automatically if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;