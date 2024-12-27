import { apiGet, apiPost, apiPut, apiDelete } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const validateUser = (user: Omit<User, "id">): boolean => {
    // Add your validation logic here
    if (!user.name || !user.email || !user.password || !user.role || !user.branch_id || !user.status || !user.condition) {
        console.error("Validation failed: Missing required fields");
        return false;
    }
    return true;
};

interface User {
    user_id: number;
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    branch_id: number;
    status: string;
    condition: string;
}

interface UseUserReturn {
    userData: User[];
    loading: boolean;
    error: unknown;
    submitUser: (newUser: Omit<User, "id">) => Promise<void>;
    updateUser: (id: number, updatedUser: Partial<User>) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    resetPassword: (id: number) => Promise<void>;
    refetch: () => Promise<void>;
}


export const useUser = (branchId: string | null): UseUserReturn => {
    const [userData, setUserData] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null); 

    const fetchData = useCallback(async () => {
        if (!branchId) {
          setError("Branch ID tidak tersedia.");
          setLoading(false);
          return;
        }
      
        setLoading(true);
        try {
          const response = await apiGet<User[]>(`users`); // Sesuaikan jika API langsung mengembalikan array pengguna
      
          if (Array.isArray(response)) {
            setUserData(response);
          } else {
            throw new Error("Invalid response format");
          }
      
          console.log("User data fetched:", response);
          setError(null);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError(error);
        } finally {
          setLoading(false);
        }
      }, [branchId]);
      

    const submitUser = useCallback(async (newUser: Omit<User, "id">) => {
        if (!newUser.branch_id) {
            console.error("Branch ID tidak tersedia");
            setError("Branch ID tidak tersedia");
            return;
        }

        if (!validateUser(newUser)) {
            return;
        }

        try {
            console.log("Submitting new user:", newUser);

            
            await apiPost(`users`, newUser);
            await fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error:", error.response?.data || error.message);
                setError(error.response?.data || error.message);
            } else {
                console.error("Unexpected error:", error);
                setError("An unexpected error occurred");
            }
        }
    }, [fetchData]);


    const updateUser = useCallback(async (id: number, updatedUser: Partial<User>) => {
        try {
            await apiPut(`users/${id}`, updatedUser);
            await fetchData();
        }
        catch (error) {
            console.error("Error updating user:", error);
            setError(error);
        }
    }, [fetchData]);


    const deleteUser = useCallback(async (id: number) => {
        try {
            await apiDelete(`users/${id}`);
            await fetchData();
        }
        catch (error) {
            console.error("Error deleting user:", error);
            setError(error);
        }
    }, [fetchData]);

    const resetPassword = useCallback(async (id: number) => {
        const payload = {
            userId: id,
            newPassword: "12345",
        };

        console.log("Reset password payload:", payload);

        try {
            await apiPost(`reset-password`, payload);
            console.log("Password reset successful");
            await fetchData(); // Refresh data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error resetting password:", error.response?.data || error.message);
                setError(error.response?.data || error.message);
            } else {
                console.error("Unexpected error resetting password:", error);
                setError("Unexpected error occurred.");
            }
        }
    }, [fetchData]);




    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData, branchId]);

    return { userData, loading, error, submitUser, updateUser, deleteUser, refetch, resetPassword };
}

