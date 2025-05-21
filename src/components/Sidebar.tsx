"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import Link from "next/link";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-bold mb-6 hidden md:block">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded hover:bg-gray-700"
            >
              <FiHome className="mr-2" /> Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/customers"
              className="flex items-center p-2 rounded hover:bg-gray-700"
            >
              <FiUsers className="mr-2" /> Customers
            </Link>
          </li>
          <li>
            <Link
              href="/orders"
              className="flex items-center p-2 rounded hover:bg-gray-700"
            >
              <FiShoppingBag className="mr-2" /> Orders
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              className="flex items-center p-2 rounded hover:bg-gray-700"
            >
              <FiShoppingBag className="mr-2" /> Products
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="flex items-center p-2 rounded hover:bg-gray-700"
            >
              <FiSettings className="mr-2" /> Settings
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 rounded hover:bg-red-600 text-left"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
