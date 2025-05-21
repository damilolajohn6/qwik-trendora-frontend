"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import Sidebar from "@/components/Sidebar2";
import Header from "@/components/Header";

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const publicRoutes = ["/auth/login", "/auth/register", "view-store"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const shouldShowLayout =
    isAuthenticated &&
    !isPublicRoute &&
    user &&
    ["admin", "manager", "staff"].includes(user.role);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {shouldShowLayout ? (
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
          >
            <Sidebar />
          </div>
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={toggleSidebar}
            ></div>
          )}
          <div className="flex-1 flex flex-col">
            <Header toggleSidebar={toggleSidebar} />
            <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
          </div>
        </div>
      ) : (
        <main className="container mx-auto py-4 px-4 sm:py-8 sm:px-6">
          {children}
        </main>
      )}
    </>
  );
};

export default LayoutContent;
