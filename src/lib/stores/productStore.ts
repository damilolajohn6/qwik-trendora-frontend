/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "../utils/api";

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: "pending" | "delivered";
    published: boolean;
    discount?: number;
    discountedPrice?: number;
    description: string;
    sku: string;
    images: { public_id: string; url: string }[];
    tags: string[];
    variants: { type: string; value: string; additionalPrice: number }[];
    publishedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    ratings: { average: number; count: number };
    reviews: { customer: string; rating: number; comment: string; createdAt: Date }[];
}

interface ProductState {
    products: Product[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
    isLoading: boolean;
    error: string | null;
    fetchProducts: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        published?: boolean;
    }) => Promise<void>;
    createProduct: (productData: any) => Promise<void>;
    updateProduct: (id: string, productData: any) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    bulkDeleteProducts: (ids: string[]) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    isLoading: false,
    error: null,

    fetchProducts: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const {
                page = 1,
                limit = 8,
                search = "",
                category = "",
                minPrice,
                maxPrice,
                sortBy = "createdAt",
                published,
            } = params;
            const response = await axios.get("/products", {
                params: { page, limit, search, category, minPrice, maxPrice, sortBy, published },
            });
            set({
                products: response.data.data,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Failed to fetch products",
                isLoading: false,
            });
        }
    },

    createProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post("/products", productData);
            set((state) => ({
                products: [response.data.data, ...state.products],
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Failed to create product",
                isLoading: false,
            });
            throw error;
        }
    },

    updateProduct: async (id, productData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(`/products/${id}`, productData);
            set((state) => ({
                products: state.products.map((product) =>
                    product._id === id ? response.data.data : product
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Failed to update product",
                isLoading: false,
            });
            throw error;
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`/products/${id}`);
            set((state) => ({
                products: state.products.filter((product) => product._id !== id),
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Failed to delete product",
                isLoading: false,
            });
            throw error;
        }
    },

    bulkDeleteProducts: async (ids) => {
        set({ isLoading: true, error: null });
        try {
            await Promise.all(ids.map((id) => axios.delete(`/products/${id}`)));
            set((state) => ({
                products: state.products.filter((product) => !ids.includes(product._id)),
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Failed to delete products",
                isLoading: false,
            });
            throw error;
        }
    },
}));
