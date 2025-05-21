/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/orders.tsx
"use client";
import { useEffect, useState } from "react";
import { useOrderStore } from "@/lib/stores/orderStore";
import { useAuthStore } from "@/lib/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const { orders, pagination, isLoading, error, fetchOrders, deleteOrder } =
    useOrderStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchOrders({
      page: currentPage,
      search,
      status,
    });
  }, [currentPage, search, status, user, router, fetchOrders]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchOrders({
      page: 1,
      search,
      status,
    });
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setCurrentPage(1);
    fetchOrders({ page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await deleteOrder(id);
        toast.success("Order cancelled successfully!");
      } catch (error) {
        toast.error("Failed to cancel order.");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search by invoice or item name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded flex-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Filter
        </button>
        <button onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded">
          Reset
        </button>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Invoice</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Total Amount</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Payment Status</th>
                <th className="border p-2">Order Time</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <Link href={`/orders/${order._id}`}>
                      {order.invoiceNumber}
                    </Link>
                  </td>
                  <td className="border p-2">{order.customer.fullname}</td>
                  <td className="border p-2">
                    ₦{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        order.paymentStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="border p-2">
                    {new Date(order.orderTime).toLocaleString()}
                  </td>
                  <td className="border p-2 flex space-x-2">
                    <Link href={`/orders/${order._id}`}>
                      <button className="text-blue-500">📝</button>
                    </Link>
                    {(order.status === "pending" ||
                      order.status === "processing") && (
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="text-red-500"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <p>
              Showing {orders.length} of {pagination.totalItems}
            </p>
            <div className="flex space-x-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
