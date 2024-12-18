import api from "./apiClient";

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
            // Hapus token dari localStorage
            localStorage.removeItem("token");
            // Redirect ke halaman login
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);
export const apiPost = async (url: string, data: any) => {
    try {
        const response = await api.post(url, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const apiGet = async (url: string) => {
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const apiPut = async (url: string, data: any) => {
    try {
        const response = await api.put(url, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const apiDelete = async (url: string) => {
    try {
        const response = await api.delete(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}
