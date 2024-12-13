import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";

interface Alat { 
    id: number;
    code: string;
    branch_id: string;
    latitude: string;
    longitude: string;
    isOn: boolean;
}

interface UseAlatReturn {
    alatData: Alat[];
    loading: boolean;
    error: unknown;  // Use unknown instead of any for error
    submitAlat: (newAlat: Omit<Alat, "id">) => Promise<void>;
    updateAlat: (id: number, updatedAlat: Partial<Alat>) => Promise<void>;
    deleteAlat: (id: number) => Promise<void>;
    refetch: () => Promise<void>; // Menambahkan refetch
}

export const useAlat = (branchId: string | number): UseAlatReturn => { // Specify branchId type
    const [alatData, setAlatData] = useState<Alat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null); // Specify error type

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet(`/sensors/branch/${branchId}`);
            console.log("response", response);
            setAlatData(response);
            setError(null);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    const submitAlat = useCallback(async (newAlat: Omit<Alat, "id">) => {
        try {
            await apiPost(`/sensor`, newAlat);
            await fetchData(); // Memanggil refetch setelah submit
        } catch (error) {
            setError(error);
            console.error("Error submitting alat:", error);
        }
    }, [fetchData]);

    const updateAlat = useCallback(async (id: number, updatedAlat: Partial<Alat>) => {
        try {
            await apiPut(`/sensor/${id}`, updatedAlat);
            await fetchData(); // Memanggil refetch setelah update
        } catch (error) {
            setError(error);
            console.error("Error updating alat:", error);
        }
    }, [fetchData]);

    const deleteAlat = useCallback(async (id: number) => {
        try {
            await apiDelete(`/sensor/${id}`);
            await fetchData(); // Memanggil refetch setelah delete
        } catch (error) {
            setError(error);
            console.error("Error deleting alat:", error);
        }
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { alatData, loading, error, submitAlat, updateAlat, deleteAlat, refetch: fetchData };
}
