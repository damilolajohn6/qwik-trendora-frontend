/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "../utils/api";

interface User {
    _id: string;
    username: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    role: "admin" | "manager" | "staff";
    status: string;
    dateJoined: string;
    avatar: string | null;
}

interface UserState {
    users: User[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
    isLoading: boolean;
    error: string | null;
    fetchUsers: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: string;
    }) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    isLoading: false,
    error: null,

    fetchUsers: async (params = { page: 1, limit: 10, search: "" }) => {
        set({ isLoading: true, error: null });
        try {
            const { page = 1, limit = 10, search = "", role, status, sortBy, sortOrder } = params;
            const response = await axios.get("/auth/users", {
                params: { page, limit, search, role, status, sortBy, sortOrder },
            });
            set({
                users: response.data.data,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to fetch users";
            set({ error: errorMessage, isLoading: false });
        }
    },
}));
