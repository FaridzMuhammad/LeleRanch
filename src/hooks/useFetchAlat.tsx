import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";

interface Alat {
    id: number;
    code: string;
    branch_id: string;
    latitude: number; // Adjusted to number since your example shows numbers
    longitude: number;
    isOn: boolean;
}

interface UseAlatReturn {
    alatData: Alat[];
    loading: boolean;
    error: unknown;
    submitAlat: (newAlat: Omit<Alat, "id">) => Promise<void>;
    updateAlat: (id: number, updatedAlat: Partial<Alat>) => Promise<void>;
    deleteAlat: (id: number) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useAlat = (branchId: string | number): UseAlatReturn => {
    const [alatData, setAlatData] = useState<Alat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);

    // Type guard to validate response data
    const isAlatArray = (data: unknown): data is Alat[] => {
        return Array.isArray(data) && data.every(item =>
            typeof item.id === "number" &&
            typeof item.code === "string" &&
            typeof item.branch_id === "number" &&
            typeof item.latitude === "number" &&
            typeof item.longitude === "number" &&
            typeof item.isOn === "boolean"
        );
    };

    // Fetch data function
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet<Alat[] | { data: Alat[] }>(`/sensors/branch/${branchId}`);
            console.log("Raw response:", response);

            if (isAlatArray(response)) {
                // If the response is directly an array
                console.log("Valid array response:", response);
                setAlatData(response);
                setError(null);
            } else if (isAlatArray((response as { data: unknown }).data)) {
                // If the response has a `data` key
                const validatedData = (response as { data: Alat[] }).data;
                console.log("Valid response data:", validatedData);
                setAlatData(validatedData);
                setError(null);
            } else {
                console.error("Invalid data format:", response);
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching alat data:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    // Submit new alat
    const submitAlat = useCallback(async (newAlat: Omit<Alat, "id">) => {
        try {
            const response = await apiPost(`/sensor`, newAlat);
            console.log('Response from submitAlat:', response);  // Log untuk debug
            await fetchData();
        } catch (error) {
            handleError(error);  
            setError(error);
        }
    }, [fetchData]);
    

    const handleError = (error: any) => {
        if (error.response) {
            console.error('API error:', error.response.data);
            alert(`Update failed: ${error.response.data.message || 'Unknown error'}`);
        } else {
            console.error('Error message:', error.message);
            alert(`Network error: ${error.message}`);
        }
    };
    
    const updateAlat = useCallback(async (id: number, updatedAlat: Partial<Alat>) => {
        try {
            console.log('Updating sensor with ID:', id, 'Data:', updatedAlat);
            const response = await apiPut(`/sensor/${id}`, updatedAlat);
            console.log('Update response:', response);
            await fetchData();
        } catch (error) {
            handleError(error);  
            setError(error);
        }
    }, [fetchData]);
    
    
    

    // Delete alat
    const deleteAlat = useCallback(async (id: number) => {
        try {
            await apiDelete(`/sensor/${id}`);
            await fetchData(); // Refetch data after deletion
        } catch (error) {
            console.error("Error deleting alat:", error);
            setError(error);
        }
    }, [fetchData]);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Return state and actions
    return {
        alatData,
        loading,
        error,
        submitAlat,
        updateAlat,
        deleteAlat,
        refetch: fetchData,
    };
};
