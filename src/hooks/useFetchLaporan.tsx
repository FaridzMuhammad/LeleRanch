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
    refetch: () => Promise<void>;
}

export const useLaporan = (branchId: string | null): UseLaporanReturn => {
    const [laporanData, setLaporanData] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null); // Use unknown for error

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet<Laporan[]>(`/history`);
            setLaporanData(response);
            setError(null);
        } catch (error) {
            console.error("Error fetching laporan data:", error);
            setError(error);
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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { laporanData, loading, error, submitLaporan, refetch: fetchData };
};
