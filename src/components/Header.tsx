"use client";
import { useAuthStore } from "@/lib/stores/authStore";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const pageTitle =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname
          .split("/")
          .pop()
          ?.replace("-", " ")
          .replace(/^\w/, (c) => c.toUpperCase()) || "Trendora";

  return (
    <header className="flex justify-between items-center mb-4 sm:mb-6 px-4 sm:px-6">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-800"
          onClick={toggleSidebar}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
          {pageTitle}
        </h2>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button
          onClick={handleLogout}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base"
        >
          Logout
        </Button>
        {user?.avatar?.url && (
          <div className="relative">
            <Image
              src={user.avatar.url}
              alt="User Avatar"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              width={40}
              height={40}
            />
            <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;