/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useOrderStore } from "@/lib/stores/orderStore";
import axios from "@/lib/utils/api";
import OverviewCard from "./OverviewCard";
import RecentOrdersTable from "./RecentOrdersTable";
import RecentCustomersTable from "./RecentCustomersTable";
import SalesTrendsChart from "./SalesTrendsChart";

interface OverviewStats {
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

interface Customer {
  _id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
}

interface SalesTrend {
  year: number;
  month: number;
  totalSales: number;
  orderCount: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [settings, setSettings] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (
        !isLoading &&
        isAuthenticated &&
        user &&
        ["admin", "manager"].includes(user.role)
      ) {
        try {
          setIsFetching(true);
          const [statsRes, settingsRes, customersRes, salesTrendsRes] =
            await Promise.all([
              axios.get("/dashboard/stats"),
              axios.get("/settings"),
              axios.get("/customers", { params: { page: 1, limit: 5 } }),
              axios.get("/dashboard/sales-trends"),
            ]);

          setOverviewStats(statsRes.data.data);
          setSettings(settingsRes.data.data);
          setCustomers(customersRes.data.data);
          setSalesTrends(salesTrendsRes.data.data);

          await fetchOrders();
        } catch (error) {
          let errorMessage = "Unknown error";
          if (typeof error === "object" && error !== null) {
            if (
              "response" in error &&
              typeof (error as any).response?.data?.message === "string"
            ) {
              errorMessage = (error as any).response.data.message;
              if ((error as any).response.status === 401) {
                router.push("/auth/login");
              }
            } else if (
              "message" in error &&
              typeof (error as any).message === "string"
            ) {
              errorMessage = (error as any).message;
            }
          }
          console.error("Error fetching dashboard data:", errorMessage);
        } finally {
          setIsFetching(false);
        }
      } else if (
        !isLoading &&
        (!isAuthenticated || !user || !["admin", "manager"].includes(user.role))
      ) {
        router.push("/auth/login");
      }
    };

    init();
  }, [isAuthenticated, user, router, fetchOrders, isLoading]);

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !["admin", "manager"].includes(user.role)) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
          Admin Dashboard
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <OverviewCard
            title="Total Customers"
            value={overviewStats.totalCustomers}
          />
          <OverviewCard
            title="Total Orders"
            value={overviewStats.totalOrders}
          />
          <OverviewCard
            title="Total Products"
            value={overviewStats.totalProducts}
          />
          <OverviewCard
            title="Total Revenue"
            value={`₦${overviewStats.totalRevenue.toLocaleString()}`}
          />
        </div>

        {/* Tables and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3">
              Sales Trends
            </h2>
            <div className="overflow-x-auto">
              <SalesTrendsChart salesData={salesTrends} />
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3">
              Recent Orders
            </h2>
            <div className="overflow-x-auto">
              <RecentOrdersTable orders={orders.slice(0, 5)} />
            </div>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3">
            Recent Customers
          </h2>
          <div className="overflow-x-auto">
            <RecentCustomersTable customers={customers} />
          </div>
        </div>

        {/* Store Information */}
        {settings && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3">
              Store Information
            </h2>
            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <strong>Name:</strong> {settings.storeName}
              </p>
              <p>
                <strong>Email:</strong> {settings.storeEmail}
              </p>
              <p>
                <strong>Contact:</strong> {settings.storeContact}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {`${settings.storeAddress.street}, ${settings.storeAddress.city}, ${settings.storeAddress.state}, ${settings.storeAddress.zipCode}, ${settings.storeAddress.country}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
