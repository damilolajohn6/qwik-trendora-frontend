/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "../utils/api";

// Export OrderItem interface
export interface OrderItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
}

interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface Customer {
    _id: string;
    fullname: string;
    email: string;
}

interface Refund {
    amount: number;
    status: "pending" | "processed" | "rejected";
    reason?: string;
}

// Export Order interface
export interface Order {
    _id: string;
    invoiceNumber: string;
    customer: Customer;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
    trackingNumber?: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
    paymentMethod: "Transfer" | "Card";
    paymentStatus: "pending" | "completed" | "failed";
    paymentIntentId?: string;
    refund?: Refund;
    orderTime: string; // API returns ISO string
    createdAt: string; // API returns ISO string
    updatedAt: string; // API returns ISO string
}

interface OrderState {
    orders: Order[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
    isLoading: boolean;
    error: string | null;
    fetchOrders: (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }) => Promise<void>;
    createOrder: (orderData: {
        items: OrderItem[];
        paymentMethod: "Transfer" | "Card";
        shippingAddress: ShippingAddress;
        paymentIntentId?: string;
    }) => Promise<{ order: Order; clientSecret: string }>;
    getOrder: (id: string) => Promise<Order>;
    updateOrder: (id: string, updateData: Partial<Order>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    processPayment: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    isLoading: false,
    error: null,

    fetchOrders: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { page = 1, limit = 10, status = "", search = "" } = params;
            const response = await axios.get("/orders", {
                params: { page, limit, status, search },
            });
            set({
                orders: response.data.data,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to fetch orders";
            console.error("Fetch Orders Error:", errorMessage, error);
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post("/orders", orderData);
            set((state) => ({
                orders: [response.data.data, ...state.orders],
                isLoading: false,
            }));
            return {
                order: response.data.data,
                clientSecret: response.data.clientSecret,
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to create order";
            console.error("Create Order Error:", errorMessage, error);
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    getOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`/orders/${id}`);
            set({ isLoading: false });
            return response.data.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to fetch order";
            console.error("Get Order Error:", errorMessage, error);
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    updateOrder: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(`/orders/${id}`, updateData);
            set((state) => ({
                orders: state.orders.map((order) =>
                    order._id === id ? response.data.data : order
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to update order";
            console.error("Update Order Error:", errorMessage, error);
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    deleteOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`/orders/${id}`);
            set((state) => ({
                orders: state.orders.filter((order) => order._id !== id),
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to delete order";
            console.error("Delete Order Error:", errorMessage, error);
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    processPayment: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`/orders/${id}/process-payment`);
            set((state) => ({
                orders: state.orders.map((order) =>
                    order._id === id ? response.data.data : order
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to process payment";
            console.error("Process Payment Error:", errorMessage, error);
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },
}));
