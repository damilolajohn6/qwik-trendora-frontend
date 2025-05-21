"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
  // return (
  //   <div>
  //     <h1 className="text-3xl font-bold mb-4">Welcome to Trendora</h1>
  //     <p>Your one-stop shop for all your needs. Sign up or log in to start shopping!</p>
  //   </div>
  // );
}
