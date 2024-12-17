// apiService.ts
import axios from "axios";
import api from "./apiClient";

// Base URL konfigurasi
const apiInstance = axios.create({
  baseURL: "http://103.127.138.198:8080/api/",
  timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Remove token from localStorage
            localStorage.removeItem("token");

            // Redirect to login page
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// GET request
export const apiGet = async (url: string) => {
  const response = await apiInstance.get(url);
  return response.data;
};

// POST request
export const apiPost = async (url: string, data: any) => {
  const response = await apiInstance.post(url, data);
  return response.data;
};

// PUT request
export const apiPut = async (url: string, data: any) => {
  const response = await apiInstance.put(url, data);
  return response.data;
};

// DELETE request
export const apiDelete = async (url: string) => {
  const response = await apiInstance.delete(url);
  return response.data;
};
