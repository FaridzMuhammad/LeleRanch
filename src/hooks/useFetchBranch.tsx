import { apiGet, apiPost, apiPut, apiDelete } from '@/api/apiService';
import { useCallback, useEffect, useState } from 'react';

interface Branch {
    id: number;
    name: string;
    city: string;
    active_time: string;
    user_id: number;
}

interface UseBranchReturn {
    branchData: Branch[];
    loading: boolean;
    error: unknown;
    submitBranch: (newBranch: Omit<Branch, 'id'>) => Promise<void>;
    updateBranch: (id: number, updatedBranch: Partial<Branch>) => Promise<void>;
    deleteBranch: (id: number) => Promise<void>;
    refetch: () => Promise<void>;
    fetchBranchById: (id: number) => Promise<Branch | undefined>;
}

export const useBranch = (userId: string): UseBranchReturn => {
    const [branchData, setBranchData] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet(`/branch/`);
            setBranchData(response as Branch[]);
            setError(null);
        } catch (error) {
            console.error('Error fetching branch data:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const submitBranch = useCallback(async (newBranch: Omit<Branch, 'id'>) => {
        try {
            await apiPost('/branch', newBranch);
            await fetchData();
        } catch (error) {
            console.error('Error submitting branch:', error);
            setError(error);
        }
    }, [fetchData]);

    const updateBranch = useCallback(async (id: number, updatedBranch: Partial<Branch>) => {
        try {
            await apiPut(`/branch/${id}`, updatedBranch);
            await fetchData();
        } catch (error) {
            console.error('Error updating branch:', error);
            setError(error);
        }
    }, [fetchData]);

    const deleteBranch = useCallback(async (id: number) => {
        try {
            await apiDelete(`/branch/${id}`);
            await fetchData();
        } catch (error) {
            console.error('Error deleting branch:', error);
            setError(error);
        }
    }, [fetchData]);

    const fetchBranchById = useCallback(async (id: number) => {
        try {
            const response = await apiGet(`/branch/${id}`);
            return response as Branch;
        } catch (error) {
            console.error('Error fetching branch by id:', error);
            setError(error);
        }
    }, [fetchData]);

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return { branchData, loading, error, submitBranch, updateBranch, deleteBranch, refetch, fetchBranchById };
};
