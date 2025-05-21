"use client";
import React from "react";
import ComingSoonPage from "@/components/ComingSoon";

import {  useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

const StorePage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      if (!isLoading && isAuthenticated && !hasRedirected.current) {
        hasRedirected.current = true; 
        router.push("/dashboard");
      }
    };

    init();
  }, [initializeAuth, isAuthenticated, isLoading, router]);

  return (
    <div>
      <ComingSoonPage />
    </div>
  );
};

export default StorePage;
