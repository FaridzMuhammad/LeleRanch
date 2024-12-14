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

// Fungsi API generik
export const apiPost = async <T, R>(url: string, data: T): Promise<R> => {
    try {
        const response = await api.post(url, data);
        return response.data as R;
    } catch (error) {
        throw error;
    }
};

export const apiGet = async <R = any>(url: string): Promise<R> => {
    try {
        const response = await api.get(url);
        return response.data as R;
    } catch (error) {
        throw error;
    }
};

export const apiPut = async <T, R>(url: string, data: T): Promise<R> => {
    try {
        const response = await api.put(url, data);
        return response.data as R;
    } catch (error) {
        throw error;
    }
};

export const apiDelete = async <R extends any>(url: string): Promise<R> => {
    try {
        const { data } = await api.delete<R>(url);
        return data;
    } catch (error) {
        throw error;
    }
};
