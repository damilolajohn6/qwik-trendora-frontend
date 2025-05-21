/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { useAuthStore } from "@/lib/stores/authStore";
import { useOrderStore } from "@/lib/stores/orderStore";

interface PaymentFormProps {
  orderId: string;
  paymentIntentId: string;
  onPaymentSuccess: () => void;
}

const PaymentForm = ({
  orderId,
  paymentIntentId,
  onPaymentSuccess,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const { processPayment } = useOrderStore();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleProcessPayment = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe is not initialized. Please try again.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentId,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.fullname,
              email: user?.email,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === "succeeded") {
        await processPayment(orderId);
        toast.success("Payment processed successfully!");
        onPaymentSuccess();
      } else {
        throw new Error("Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="mt-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Card Details
      </label>
      <div className="bg-gray-50 border border-gray-300 p-3 rounded-md shadow-sm">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
        onClick={handleProcessPayment}
        className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
        disabled={isProcessingPayment || !stripe || !elements}
      >
        {isProcessingPayment ? "Processing..." : "Process Payment"}
      </button>
    </div>
  );
};

export default PaymentForm;
