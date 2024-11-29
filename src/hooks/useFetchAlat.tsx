import { apiGet,apiPost, apiPut, apiDelete } from "@/api/apiService";

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
    error: any;
    submitAlat: (newAlat: Omit<Alat, "id">) => Promise<void>;
    updateAlat: (id: number, updatedAlat: Partial<Alat>) => Promise<void>;
    deleteAlat: (id: number) => Promise<void>;
}

export const useAlat = (branchId: any): UseAlatReturn => {
    const [alatData, setAlatData] = useState<Alat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet(`/sensors/branch/${branchId}`);
            console.log("response", response);
            setAlatData(response);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    const submitAlat = useCallback(async (newAlat: Omit<Alat, "id">) => {
        try {
            const response = await apiPost(`/sensor`, newAlat);
            setAlatData((prevData) => [...prevData, response.data]);
        } catch (error) {
            setError(error);
            console.error("Error submitting schedule:", error);
        }
    }, []);

    const updateAlat = useCallback(async (id: number, updatedAlat: Partial<Alat>) => {
        try {
            const response = await apiPut(`/sensor/${id}`, updatedAlat);
            setAlatData((prevData) =>
                prevData.map((alat) => (alat.id === id ? response.data : alat))
            );
            console.log("response", response);
        } catch (error) {
            setError(error);
            console.error("Error updating schedule:", error);
        }
    }, []);

    const deleteAlat = useCallback(async (id: number) => {
        try {
            await apiDelete(`/sensor/${id}`);
            setAlatData((prevData) => prevData.filter((alat) => alat.id !== id));
        } catch (error) {
            setError(error);
            console.error("Error deleting schedule:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { alatData, loading, error, submitAlat, updateAlat, deleteAlat };
}