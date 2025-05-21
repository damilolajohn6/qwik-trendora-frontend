"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type LoginError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "manager" | "admin">("staff");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRedirected = useRef(false); // Track if a redirect has already happened

  useEffect(() => {
    const init = async () => {
      await initializeAuth(); // Ensure auth is initialized
      if (!isLoading && isAuthenticated && !hasRedirected.current) {
        hasRedirected.current = true; // Prevent multiple redirects
        router.push("/dashboard");
      }
    };

    init();
  }, [initializeAuth, isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password, role);
      toast.success("Welcome back!", {
        description: "Login successful",
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as LoginError;
      toast.error(
        err.response?.data?.message || err.message || "An error occurred",
        {
          description: "Login failed",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "staff" | "manager" | "admin")
              }
              className="w-full p-2 border rounded"
              required
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
