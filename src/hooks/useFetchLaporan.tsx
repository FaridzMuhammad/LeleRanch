import{apiGet, apiPost} from "@/api/apiService";

import {useCallback, useEffect, useState} from "react";

interface Laporan{
    id: number;
    tanggal: string;
    catatan: string;
    user_id: string;
    sensor_id: string;
    branch_id: string;
}

interface UseLaporanReturn {
    laporanData: Laporan[];
    loading: boolean;
    error: any;
    submitLaporan: (newLaporan: Omit<Laporan, "id">) => Promise<void>;
}

export const useLaporan = (branchId: any): UseLaporanReturn => {
    const [laporanData, setLaporanData] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet(`/history`);
            console.log("response", response);
            setLaporanData(response);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    const submitLaporan = useCallback(async (newLaporan: Omit<Laporan, "id">) => {
        try {
            const response = await apiPost(`/history`, newLaporan);
            setLaporanData((prevData) => [...prevData, response.data]);
        } catch (error) {
            setError(error);
            console.error("Error submitting schedule:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return{laporanData, loading, error, submitLaporan};
}