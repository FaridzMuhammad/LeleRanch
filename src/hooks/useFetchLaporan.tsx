import { apiGet, apiPost } from "@/api/apiService"; // Hapus apiPut dan apiDelete
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
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`/history`);
      setLaporanData(response as Laporan[]);
      setError(null);
    } catch (error) {
      console.error("Error fetching laporan data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []); // Hapus 'branchId' dari dependensi

  const submitLaporan = useCallback(
    async (newLaporan: Omit<Laporan, "id">) => {
      try {
        await apiPost(`/history`, newLaporan);
        await fetchData(); // Memanggil refetch setelah submit
      } catch (error) {
        setError(error);
        console.error("Error submitting laporan:", error);
        throw error;
      }
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { laporanData, loading, error, submitLaporan, refetch: fetchData };
};
