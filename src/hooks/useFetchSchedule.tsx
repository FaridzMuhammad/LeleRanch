import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService"; // Pastikan apiPost dan apiPut diekspor dari apiService
import { useCallback, useEffect, useState } from "react";

interface Schedule {
  id: number;
  description: string;
  branch_id: string;
  sensor_id: string;
  weight: string;
  onStart: string;
  onEnd: string;
  user_id: string;
}

interface UseScheduleReturn {
  scheduleData: Schedule[];
  loading: boolean;
  error: any;
  submitSchedule: (newSchedule: Omit<Schedule, "id">) => Promise<void>;
  updateSchedule: (id: number, updatedSchedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
}

export const useSchedule = (branchId: any): UseScheduleReturn => {
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`/foodfish`);
      console.log("response", response); 
      setScheduleData(response);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const submitSchedule = useCallback(async (newSchedule: Omit<Schedule, "id">) => {
    try {
      const response = await apiPost(`/foodfish`, newSchedule);
      setScheduleData((prevData) => [...prevData, response.data]);
    } catch (error) {
      setError(error);
      console.error("Error submitting schedule:", error);
    }
  }, []);

  const updateSchedule = useCallback(async (id: number, updatedSchedule: Partial<Schedule>) => {
    try {
      const response = await apiPut(`/foodfish/${id}`, updatedSchedule);
      setScheduleData((prevData) =>
        prevData.map((schedule) => (schedule.id === id ? response.data : schedule))
      );
      console.log("response", response);
    } catch (error) {
      setError(error);
      console.error("Error updating schedule:", error);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: number) => {
    try {
      await apiDelete(`/foodfish/${id}`);
      setScheduleData((prevData) => prevData.filter((schedule) => schedule.id !== id));
    } catch (error) {
      setError(error);
      console.error("Error deleting schedule:", error);
    }
  }, []);

  useEffect(() => {
      fetchData();
    }, [fetchData]);

  return { scheduleData, loading, error, submitSchedule, updateSchedule, deleteSchedule };
};
