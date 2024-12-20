import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";

interface Schedule {
  sensor_id: string;
  code: string;
  id: number;
  description: string;
  branch_id: string;
  weight: string;
  onStart: string;
  onEnd: string;
  user_id: string;
}

interface UseScheduleReturn {
  scheduleData: Schedule[];
  loading: boolean;
  error: unknown; // Use unknown for error
  submitSchedule: (newSchedule: Omit<Schedule, "id">) => Promise<void>;
  updateSchedule: (id: number, updatedSchedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
}

export const useSchedule = (): UseScheduleReturn => {
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null); // Use unknown for error

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`/foodfish`);
      console.log("response", response);
      setScheduleData(response as Schedule[]);
    } catch (error) {
      setError(error);
      console.error("Error fetching schedule data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleError = (error: unknown) => {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      const apiError = error as { response: { data: { message: string } } };
      console.error("API error:", apiError.response.data);
      alert(`Update failed: ${apiError.response.data.message || "Unknown error"}`);
    } else if (error instanceof Error) {
      console.error("Error message:", error.message);
      alert(`Network error: ${error.message}`);
    } else {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred.");
    }
  };

  const submitSchedule = useCallback(async (newSchedule: Omit<Schedule, "id">) => {
    try {
      const response = await apiPost(`/foodfish`, newSchedule) as { data: Schedule };
      setScheduleData((prevData) => [...prevData, response.data]);
    } catch (error) {
      setError(error);
      console.error("Error submitting schedule:", error);
    }
  }, []);

  const updateSchedule = useCallback(async (id: number, updatedSchedule: Partial<Schedule>) => {
    try {
      const response = await apiPut(`/foodfish/${id}`, updatedSchedule) as { data: Schedule };
      setScheduleData((prevData) =>
        prevData.map((schedule) => (schedule.id === id ? response.data : schedule))
      );
      console.log("response", response);
    } catch (error) {
      handleError(error); // Handle error more specifically
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
