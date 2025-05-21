"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useOrderStore } from "@/lib/stores/orderStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Order {
  _id: string;
  
}

interface CheckoutFormProps {
  order: Order;
  clientSecret: string;
}

export default function CheckoutForm({
  order,
  clientSecret,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { processPayment } = useOrderStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: user?.fullname,
            email: user?.email,
          },
        },
      }
    );

    if (error) {
      toast.error(error.message, {
        description: "Payment failed",
      });
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await processPayment(order._id);
      toast.success("Your order has been processed!", {
        description: "Payment successful",
      });
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
          </div>
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
