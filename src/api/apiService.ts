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

// Define a generic type for the API response
export const apiPost = async <T, U>(url: string, data: U): Promise<T> => {
    try {
        const response = await api.post<T>(url, data);
        return response.data;
    } catch (error: unknown) {
        // Jika ingin akses properti tertentu, pastikan error dikonversi ke tipe yang sesuai
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw error;
    }
};

export const apiGet = async<T>(url: string): Promise<T> => {
    try {
        const response = await api.get<T>(url);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw error;
    }
};

        export const apiPut = async <T, U>(url: string, data: U): Promise<T> => {
    try {
        const response = await api.put<T>(url, data);
                return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
                throw error;
    }
};

                export const apiDelete = async <T>(url: string): Promise<T> => {
    try {
        const response = await api.delete<T>(url);
                        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
                        throw error;
    }
};




