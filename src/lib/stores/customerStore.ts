/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "../utils/api";

interface Customer {
    _id: string;
    dateJoined: string;
    fullname: string;
    email: string;
    phoneNumber: string;
}

interface CustomerState {
    customers: Customer[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
    isLoading: boolean;
    error: string | null;
    fetchCustomers: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: string;
    }) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
    customers: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    isLoading: false,
    error: null,

    fetchCustomers: async (params = { page: 1, limit: 10, search: "" }) => {
        set({ isLoading: true, error: null });
        try {
            const { page = 1, limit = 10, search = "", status, startDate, endDate, sortBy, sortOrder } = params;
            const response = await axios.get("/customers", {
                params: { page, limit, search, status, startDate, endDate, sortBy, sortOrder },
            });
            set({
                customers: response.data.data,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to fetch customers";
            set({ error: errorMessage, isLoading: false });
        }
    },
}));
