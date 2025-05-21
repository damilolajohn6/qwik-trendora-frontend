/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrderStore, Order, OrderItem } from "@/lib/stores/orderStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import PaymentForm from "@/components/PaymentForm";

const OrderDetailsPage = () => {
  const { getOrder, updateOrder } = useOrderStore();
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();

  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateData, setUpdateData] = useState<{
    status:
      | "pending"
      | "processing"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "refunded";
    trackingNumber: string;
  }>({
    status: "pending",
    trackingNumber: "",
  });

  const id = params.id as string;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.");
      return;
    }

    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      .then((stripeInstance) => {
        if (stripeInstance) {
          setStripe(stripeInstance);
        } else {
          console.error("Stripe.js failed to load.");
          toast.error("Failed to load payment system. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error loading Stripe.js:", error);
        toast.error("Failed to load payment system. Please try again later.");
      });
  }, []);

  const refetchOrderDetails = useCallback(async () => {
    try {
      const fetchedOrder = await getOrder(id);
      if (!fetchedOrder) {
        toast.error("Order not found or unauthorized access.");
        router.push("/orders");
        return null;
      }

      if (
        user?.role === "customer" &&
        fetchedOrder.customer.email !== user?.email
      ) {
        toast.error("You are not authorized to view this order.");
        router.push("/orders");
        return null;
      }

      setOrder(fetchedOrder);
      setUpdateData({
        status: fetchedOrder.status,
        trackingNumber: fetchedOrder.trackingNumber || "",
      });
      setIsLoading(false);
      return fetchedOrder;
    } catch (error) {
      toast.error("Failed to fetch order details.");
      router.push("/orders");
      setIsLoading(false);
      return null;
    }
  }, [id, getOrder, router, user]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    refetchOrderDetails();
  }, [user, router, refetchOrderDetails]);

  const handleUpdate = async () => {
    try {
      await updateOrder(id, updateData);
      await refetchOrderDetails();
      toast.success("Order updated successfully!");
    } catch (error) {
      toast.error("Failed to update order.");
    }
  };

  if (isLoading || !order)
    return (
      <p className="p-6 text-center text-lg text-gray-700">
        Loading order details...
      </p>
    );

  const elementsOptions: StripeElementsOptions = {
    clientSecret: order.paymentIntentId, // Assuming paymentIntentId holds the client secret
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Order Details - #{order.invoiceNumber}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Customer Details
          </h2>
          <p className="text-gray-600">
            <span className="font-medium">Name:</span> {order.customer.fullname}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {order.customer.email}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Shipping Address
          </h2>
          <p className="text-gray-600">{order.shippingAddress.street}</p>
          <p className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>
          <p className="text-gray-600">
            {order.shippingAddress.zipCode}, {order.shippingAddress.country}
          </p>
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">
          Order Items
        </h2>
        <ul className="divide-y divide-gray-200">
          {order.items.map((item: OrderItem, index: number) => (
            <li key={index} className="py-2 flex justify-between items-center">
              <span className="text-gray-700">
                {item.name} (x{item.quantity})
              </span>
              <span className="font-semibold text-gray-800">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t-2 border-gray-200 flex justify-between items-center font-bold text-lg text-gray-900">
          <span>Total Amount:</span>
          <span>₦{order.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Order Status
          </h2>
          <p
            className={`font-semibold text-lg ${
              order.status === "delivered"
                ? "text-green-600"
                : order.status === "cancelled"
                ? "text-red-600"
                : "text-orange-600"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </p>
          {(user?.role === "admin" || user?.role === "manager") && (
            <div className="mt-3">
              <label
                htmlFor="status-select"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Update Status:
              </label>
              <select
                id="status-select"
                value={updateData.status}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    status: e.target.value as
                      | "pending"
                      | "processing"
                      | "shipped"
                      | "delivered"
                      | "cancelled"
                      | "refunded",
                  })
                }
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Tracking Information
          </h2>
          <p className="text-gray-600">
            <span className="font-medium">Tracking Number:</span>{" "}
            {order.trackingNumber || "N/A"}
          </p>
          {(user?.role === "admin" || user?.role === "manager") && (
            <div className="mt-3">
              <label
                htmlFor="tracking-input"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Update Tracking:
              </label>
              <input
                id="tracking-input"
                type="text"
                value={updateData.trackingNumber}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    trackingNumber: e.target.value,
                  })
                }
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tracking number"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">
          Payment Details
        </h2>
        <p className="text-gray-600">
          <span className="font-medium">Method:</span> {order.paymentMethod}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`font-semibold ${
              order.paymentStatus === "completed"
                ? "text-green-600"
                : order.paymentStatus === "failed"
                ? "text-red-600"
                : "text-orange-600"
            }`}
          >
            {order.paymentStatus.charAt(0).toUpperCase() +
              order.paymentStatus.slice(1)}
          </span>
        </p>
        {order.paymentIntentId && (
          <p className="text-gray-600">
            <span className="font-medium">Payment ID:</span>{" "}
            {order.paymentIntentId}
          </p>
        )}

        {order.paymentStatus === "pending" &&
          order.paymentMethod === "Card" &&
          stripe &&
          order.paymentIntentId && (
            <Elements stripe={stripe} options={elementsOptions}>
              <PaymentForm
                orderId={order._id}
                paymentIntentId={order.paymentIntentId}
                onPaymentSuccess={refetchOrderDetails}
              />
            </Elements>
          )}
        {order.paymentStatus === "pending" &&
          order.paymentMethod === "Card" &&
          !stripe && (
            <p className="text-red-500 mt-2">Loading payment options...</p>
          )}
        {order.paymentStatus === "pending" &&
          order.paymentMethod === "Card" &&
          stripe &&
          !order.paymentIntentId && (
            <p className="text-red-500 mt-2">
              Payment Intent ID is missing for this order.
            </p>
          )}
      </div>

      {order.refund && (
        <div className="mb-8 bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Refund Information
          </h2>
          <p className="text-gray-600">
            <span className="font-medium">Amount:</span> ₦
            {order.refund.amount.toLocaleString()}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`font-semibold ${
                order.refund.status === "processed"
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {order.refund.status.charAt(0).toUpperCase() +
                order.refund.status.slice(1)}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Reason:</span>{" "}
            {order.refund.reason || "N/A"}
          </p>
        </div>
      )}

      {(user?.role === "admin" || user?.role === "manager") && (
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
