/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "../utils/api";
import { toast } from "react-toastify";

interface Avatar {
    public_id: string | null;
    url: string | null;
}

interface User {
    id: string;
    username: string;
    email: string;
    role: "customer" | "staff" | "admin" | "manager";
    fullname: string;
    phoneNumber: string;
    avatar?: Avatar;
}

type UserRegistrationData = Omit<User, "id"> & {
    password: string;
};

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, roleForLoginEndpointContext?: "customer" | "staff" | "admin" | "manager") => Promise<void>;
    register: (userData: UserRegistrationData) => Promise<any>;
    logout: () => void;
    initializeAuth: () => Promise<void>;
    updateUserInStore: (updatedUserData: Partial<User>) => void;
    refreshToken: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not defined. Please check your .env.local file.");
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    initializeAuth: async () => {
        set({ isLoading: true });
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (storedToken && API_URL) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            try {
                const response = await axios.get(`${API_URL}/auth/profile`);
                if (response.data.success && response.data.user) {
                    set({
                        user: response.data.user,
                        token: storedToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    throw new Error("Invalid response from profile endpoint.");
                }
            } catch (error) {
                if (typeof error === "object" && error !== null && "response" in error) {
                    // @ts-ignore
                    const status = error.response?.status;
                    if (status === 401) {
                        toast.error("Session expired. Please log in again.");
                        if (typeof window !== "undefined") {
                            localStorage.removeItem("token");
                            window.location.href = "/auth/login";
                        }
                    }
                    // @ts-ignore
                    console.error("Auth initialization failed:", error.response?.data?.message || error.message);
                } else {
                    console.error("Auth initialization failed:", (error as Error).message || error);
                }
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
                delete axios.defaults.headers.common["Authorization"];
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            }
        } else {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: async (email, password, roleForLoginEndpointContext) => {
        if (!API_URL) {
            set({ isLoading: false });
            throw new Error("API URL not configured for login.");
        }
        set({ isLoading: true });
        const endpoint = roleForLoginEndpointContext === "customer"
            ? `${API_URL}/customers/login`
            : `${API_URL}/auth/login`;

        try {
            const response = await axios.post(endpoint, { email, password });
            const { token, data } = response.data;

            if (typeof window !== "undefined") localStorage.setItem("token", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            set({ user: data, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            if (typeof error === "object" && error !== null && "response" in error) {
                // @ts-ignore
                const status = error.response?.status;
                if (status === 401) {
                    toast.error("Invalid credentials. Please try again.");
                }
                // @ts-ignore
                console.error("Login failed:", error.response?.data?.message || error.message);
            } else {
                console.error("Login failed:", (error as Error).message || error);
            }
            throw error;
        }
    },

    register: async (userData: UserRegistrationData) => {
        if (!API_URL) {
            set({ isLoading: false });
            throw new Error("API URL not configured for registration.");
        }
        set({ isLoading: true });
        const endpoint = userData.role === "customer"
            ? `${API_URL}/customers/register`
            : `${API_URL}/auth/register`;

        try {
            const response = await axios.post(endpoint, userData);
            if (userData.role === "customer" && response.data.token) {
                const { token, data } = response.data;
                if (typeof window !== "undefined") localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                set({ user: data, token, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
            return response.data;
        } catch (error) {
            set({ isLoading: false });
            if (typeof error === "object" && error !== null && "response" in error) {
                // @ts-ignore
                console.error("Registration failed:", error.response?.data?.message || error.message);
            } else {
                console.error("Registration failed:", (error as Error).message || error);
            }
            throw error;
        }
    },

    logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
        }
    },

    updateUserInStore: (updatedUserData: Partial<User>) => {
        set((state) => ({
            user: state.user ? { ...state.user, ...updatedUserData } : null,
        }));
    },

    refreshToken: async () => {
        const currentToken = get().token;
        if (!currentToken || !API_URL) {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
            }
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/refresh-token`, { token: currentToken });
            const newToken = response.data.token;
            if (typeof window !== "undefined") localStorage.setItem("token", newToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            set({ token: newToken });
        } catch (error) {
            console.error("Token refresh failed:", error);
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
            }
        }
    },
}));
