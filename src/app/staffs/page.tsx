/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "react-toastify";
import axios from "@/lib/utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiFilter, FiRefreshCw, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Image from "next/image";

interface User {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  role: "admin" | "manager" | "staff";
  status: string;
  dateJoined: string;
  avatar: string | null;
}

interface SortConfig {
  key: keyof User | "dateJoined";
  direction: "asc" | "desc";
}

const StaffsPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { users, pagination, isLoading, error, fetchUsers } = useUserStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "dateJoined",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    sortBy: "dateJoined",
    sortOrder: "desc",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      !["admin", "manager", "staff"].includes(user.role)
    ) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  // Fetch users with filters and sorting
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers({
        page: currentPage,
        limit: 10,
        search,
        role: filters.role || undefined,
        status: filters.status || undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });
    }
  }, [currentPage, search, filters, sortConfig, isAuthenticated, fetchUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof User | "dateJoined") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to delete");
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Only admins can perform bulk deletion");
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete ${selectedUsers.length} user(s)?`
      )
    ) {
      try {
        await Promise.all(
          selectedUsers.map((id) => axios.delete(`/auth/users/${id}`))
        );
        setSelectedUsers([]);
        fetchUsers({
          page: currentPage,
          limit: 10,
          search,
          role: filters.role || undefined,
          status: filters.status || undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        });
        toast.success("Selected users deleted successfully!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete users");
      }
    }
  };

  const applyFilters = () => {
    setSortConfig({
      key: filters.sortBy as keyof User,
      direction: filters.sortOrder as "asc" | "desc",
    });
    setCurrentPage(1);
    setIsFilterOpen(false);
    toast.success("Filters applied");
  };

  const handleReset = () => {
    setSearch("");
    setFilters({
      role: "",
      status: "",
      sortBy: "dateJoined",
      sortOrder: "desc",
    });
    setSortConfig({ key: "dateJoined", direction: "desc" });
    setCurrentPage(1);
    fetchUsers({ page: 1, limit: 10 });
    toast.info("Filters reset");
  };

  const handleEdit = (id: string) => {
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      toast.error("Invalid user ID");
      return;
    }
    router.push(`/staffs/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      toast.error("Invalid user ID");
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Only admins can delete users");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/auth/users/${id}`);
        fetchUsers({
          page: currentPage,
          limit: 10,
          search,
          role: filters.role || undefined,
          status: filters.status || undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        });
        toast.success("User deleted successfully!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading)
    return <p className="text-center text-lg text-gray-700 p-6">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Input
          type="text"
          placeholder="Search by username/email/phone/fullname"
          value={search}
          onChange={handleSearch}
          className="w-full sm:w-1/3 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          aria-label="Search users"
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {user?.role === "admin" && selectedUsers.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              aria-label="Delete selected users"
            >
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                <FiFilter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[90vw] rounded-md">
              <DialogHeader>
                <DialogTitle>Filter Users</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role
                  </label>
                  <Select
                    value={filters.role}
                    onValueChange={(value) =>
                      setFilters({ ...filters, role: value })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="sortBy"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sort By
                  </label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateJoined">Date Joined</SelectItem>
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="fullname">Full Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="sortOrder"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sort Order
                  </label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sortOrder: value })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(false)}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleReset}
            className="bg-gray-200 text-gray-600 hover:bg-gray-300"
            aria-label="Reset filters"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border-b">
                <Checkbox
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all users"
                />
              </th>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">
                <button
                  onClick={() => handleSort("username")}
                  className="flex items-center gap-1 focus:outline-none"
                  aria-label="Sort by username"
                >
                  Username
                  {sortConfig.key === "username" &&
                    (sortConfig.direction === "asc" ? (
                      <FiArrowUp />
                    ) : (
                      <FiArrowDown />
                    ))}
                </button>
              </th>
              <th className="p-3 border-b">
                <button
                  onClick={() => handleSort("fullname")}
                  className="flex items-center gap-1 focus:outline-none"
                  aria-label="Sort by full name"
                >
                  Full Name
                  {sortConfig.key === "fullname" &&
                    (sortConfig.direction === "asc" ? (
                      <FiArrowUp />
                    ) : (
                      <FiArrowDown />
                    ))}
                </button>
              </th>
              <th className="p-3 border-b">
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-1 focus:outline-none"
                  aria-label="Sort by email"
                >
                  Email
                  {sortConfig.key === "email" &&
                    (sortConfig.direction === "asc" ? (
                      <FiArrowUp />
                    ) : (
                      <FiArrowDown />
                    ))}
                </button>
              </th>
              <th className="p-3 border-b">Phone</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">
                <button
                  onClick={() => handleSort("dateJoined")}
                  className="flex items-center gap-1 focus:outline-none"
                  aria-label="Sort by date joined"
                >
                  Date Joined
                  {sortConfig.key === "dateJoined" &&
                    (sortConfig.direction === "asc" ? (
                      <FiArrowUp />
                    ) : (
                      <FiArrowDown />
                    ))}
                </button>
              </th>
              <th className="p-3 border-b">Avatar</th>
              <th className="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User, index: number) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={() => handleSelectUser(user._id)}
                    aria-label={`Select user ${user.username}`}
                  />
                </td>
                <td className="p-3">{(currentPage - 1) * 10 + index + 1}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.fullname}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber || "N/A"}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  {new Date(user.dateJoined).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`${user.fullname}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(user._id)}
                    className="text-blue-600 hover:underline focus:outline-none"
                    aria-label={`Edit user ${user.username}`}
                  >
                    ✏️
                  </button>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:underline focus:outline-none"
                      aria-label={`Delete user ${user.username}`}
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user: User, index: number) => (
          <div key={user._id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={selectedUsers.includes(user._id)}
                onCheckedChange={() => handleSelectUser(user._id)}
                aria-label={`Select user ${user.username}`}
              />
              <span className="font-semibold">
                #{(currentPage - 1) * 10 + index + 1}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`${user.fullname}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                  width={48}
                  height={48}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  N/A
                </div>
              )}
              <div>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Full Name:</strong> {user.fullname}
                </p>
              </div>
            </div>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Date Joined:</strong>{" "}
              {new Date(user.dateJoined).toLocaleDateString()}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(user._id)}
                className="text-blue-600 hover:underline focus:outline-none"
                aria-label={`Edit user ${user.username}`}
              >
                ✏️
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-600 hover:underline focus:outline-none"
                  aria-label={`Delete user ${user.username}`}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-600">
          Showing {(currentPage - 1) * 10 + 1}–
          {Math.min(currentPage * 10, pagination.totalItems)} of{" "}
          {pagination.totalItems}
        </p>
        <div className="flex space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            aria-label="Previous page"
          >
            Previous
          </Button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                aria-label={`Page ${page}`}
              >
                {page}
              </Button>
            )
          )}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffsPage;
