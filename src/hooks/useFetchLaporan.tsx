import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";

interface Laporan {
    date: string | number | Date;
    description: string;
    id: number;
    tanggal: string;
    catatan: string;
    user_id: string;
    sensor_id: string;
    branch_id: string;
    user?: {
        name: string;
    };
    sensor?: {
        code: string;
    };
    branch?: {
        name: string;
    };
}

interface UseLaporanReturn {
    laporanData: Laporan[];
    loading: boolean;
    error: unknown; // Use unknown for error type
    submitLaporan: (newLaporan: Omit<Laporan, "id">) => Promise<void>;
    updateLaporan: (id: number, updatedLaporan: Partial<Laporan>) => Promise<void>;
    deleteLaporan: (id: number) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useLaporan = (branchId: string | null): UseLaporanReturn => {
    const [laporanData, setLaporanData] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null); // Use unknown for error

    const fetchData = useCallback(async () => {
        if (!branchId) {
            setError("Branch ID tidak tersedia.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await apiGet(`/history`);
            console.log("Fetched Laporan Data:", response.data);
            setLaporanData(response.data);
            setError(null);
        } catch (error) {
            setError(error);
            console.error("Error fetching laporan:", error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    const submitLaporan = useCallback(async (newLaporan: Omit<Laporan, "id">) => {
        try {
            await apiPost(`/history`, newLaporan);
            await fetchData(); // Memanggil refetch setelah submit
        } catch (error) {
            setError(error);
            console.error("Error submitting laporan:", error);
            throw error;
        }
    }, [fetchData]);

    const updateLaporan = useCallback(async (id: number, updatedLaporan: Partial<Laporan>) => {
        try {
            await apiPut(`/history/${id}`, updatedLaporan);
            await fetchData(); // Memanggil refetch setelah update
        } catch (error) {
            setError(error);
            console.error("Error updating laporan:", error);
            throw error;
        }
    }, [fetchData]);

    const deleteLaporan = useCallback(async (id: number) => {
        try {
            await apiDelete(`/history/${id}`);
            await fetchData(); // Memanggil refetch setelah delete
        } catch (error) {
            setError(error);
            console.error("Error deleting laporan:", error);
            throw error;
        }
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { laporanData, loading, error, submitLaporan, updateLaporan, deleteLaporan, refetch: fetchData };
};
