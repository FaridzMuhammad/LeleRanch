import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";

interface Alat {
  isOpen: boolean;
  id: number;
  code: string;
  branch_id: string;
  latitude: number;
  longitude: number;
  isOn: boolean;
  isDetected: boolean;
}

interface UseAlatReturn {
  alatData: Alat[];
  loading: boolean;
  error: unknown;
  submitAlat: (newAlat: Omit<Alat, "id">) => Promise<void>;
  updateAlat: (id: number, updatedAlat: Partial<Alat>) => Promise<void>;
  deleteAlat: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
  fetchSensorById: (id: number) => Promise<Alat | undefined>;
}

export const useAlat = (branchId: string | number): UseAlatReturn => {
  const [alatData, setAlatData] = useState<Alat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`/sensor/`);
      setAlatData(response as Alat[]);
      setError(null);
    } catch (error) {
      console.error("Error fetching alat data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAlat = useCallback(
    async (newAlat: Omit<Alat, "id">) => {
      try {
        await apiPost(`sensor`, newAlat);
        await fetchData();
      } catch (error) {
        console.error("Error submitting alat:", error);
        setError(error);
      }
    },
    [fetchData]
  );

  const updateAlat = useCallback(
    async (id: number, updatedAlat: Partial<Alat>) => {
      try {
        await apiPut(`sensor/${id}`, updatedAlat);
        await fetchData();
      } catch (error) {
        console.error("Error updating alat:", error);
        setError(error);
      }
    },
    [fetchData]
  );

  const deleteAlat = useCallback(
    async (id: number) => {
      try {
        await apiDelete(`sensor/${id}`);
        await fetchData();
      } catch (error) {
        console.error("Error deleting alat:", error);
        setError(error);
      }
    },
    [fetchData]
  );

  const fetchSensorById = useCallback(async (id: number) => {
    try {
      const response = await apiGet(`/sensor/${id}`);
      return response as Alat;
    } catch (error) {
      console.error("Error fetching alat data:", error);
      setError(error);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { alatData, loading, error, submitAlat, updateAlat, deleteAlat, refetch: fetchData, fetchSensorById };
};
