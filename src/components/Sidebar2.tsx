"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaBox,
  FaUser,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaStore,
} from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt className="w-5 h-5" />,
    },
    {
      href: "/products",
      label: "Products",
      icon: <FaBox className="w-5 h-5" />,
    },
    {
      href: "/customers",
      label: "Customer",
      icon: <FaUser className="w-5 h-5" />,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: <FaClipboardList className="w-5 h-5" />,
    },
    { href: "/staffs", label: "Staffs", icon: <FaUsers className="w-5 h-5" /> },
    {
      href: "/settings",
      label: "Settings",
      icon: <FaCog className="w-5 h-5" />,
    },
    {
      href: "/view-store",
      label: "View Store",
      icon: <FaStore className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-full h-full bg-white shadow-md">
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Trendora
        </h1>
      </div>
      <nav className="mt-4 sm:mt-6">
        <ul className="space-y-2 px-2 sm:px-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                  pathname === link.href
                    ? "text-green-600 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2 flex items-center">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
