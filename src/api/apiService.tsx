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
            // Remove token from localStorage
            localStorage.removeItem("token");

            // Redirect to login page
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

// Generic API functions with fallback default types
export const apiPost = async <T, R = unknown>(url: string, data: T): Promise<R> => {
    try {
        const response = await api.post<R>(url, data); // Specify response type R
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const apiGet = async <R = unknown>(url: string): Promise<R> => {
    try {
        const response = await api.get<R>(url); // Specify response type R
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const apiPut = async <T, R = unknown>(url: string, data: T): Promise<R> => {
    try {
        const response = await api.put<R>(url, data); // Specify response type R
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const apiDelete = async <R = unknown>(url: string): Promise<R> => {
    try {
        const { data } = await api.delete<R>(url); // Specify response type R
        return data;
    } catch (error) {
        throw error;
    }
};
