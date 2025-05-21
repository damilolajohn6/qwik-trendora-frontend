"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Trendora
        </Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/orders" className="hover:underline">
                Orders
              </Link>
              <Link href="/checkout" className="hover:underline">
                Checkout
              </Link>
              <Button
                onClick={logout}
                variant="outline"
                className="text-white border-white"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:underline">
                Login
              </Link>
              <Link href="/auth/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

