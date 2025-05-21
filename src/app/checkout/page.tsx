/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useOrderStore } from "@/lib/stores/orderStore";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { cart, createOrder, clearCart } = useOrderStore();
  const [order, setOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    const placeOrder = async () => {
      const orderData = {
        items: cart,
        paymentMethod: "Card",
        shippingAddress: {
          street: "123 Main St",
          city: "Lagos",
          state: "Lagos",
          zipCode: "100001",
          country: "Nigeria",
        },
      };
      const { order: newOrder, clientSecret } = await createOrder(orderData);
      setOrder(newOrder);
      setClientSecret(clientSecret);
      clearCart();
    };

    if (cart.length > 0) {
      placeOrder();
    }
  }, [cart, createOrder, clearCart]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty. Add items to proceed.</p>
      ) : order && clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm order={order} clientSecret={clientSecret} />
        </Elements>
      ) : (
        <p>Processing your order...</p>
      )}
    </div>
  );
}
