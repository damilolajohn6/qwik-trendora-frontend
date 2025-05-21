/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCustomerStore } from "@/lib/stores/customerStore";
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

interface Customer {
  _id: string;
  dateJoined: string;
  fullname: string;
  email: string;
  phoneNumber: string;
}

interface SortConfig {
  key: keyof Customer | "dateJoined";
  direction: "asc" | "desc";
}

const CustomersPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { customers, pagination, isLoading, error, fetchCustomers } =
    useCustomerStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "dateJoined",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
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

  // Fetch customers with filters and sorting
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers({
        page: currentPage,
        limit: 10,
        search,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });
    }
  }, [
    currentPage,
    search,
    filters,
    sortConfig,
    isAuthenticated,
    fetchCustomers,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof Customer | "dateJoined") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((customer) => customer._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one customer to delete");
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete ${selectedCustomers.length} customer(s)?`
      )
    ) {
      try {
        await Promise.all(
          selectedCustomers.map((id) => axios.delete(`/customers/${id}`))
        );
        setSelectedCustomers([]);
        fetchCustomers({
          page: currentPage,
          limit: 10,
          search,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        });
        toast.success("Selected customers deleted successfully!");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete customers"
        );
      }
    }
  };

  const applyFilters = () => {
    setSortConfig({
      key: filters.sortBy as keyof Customer,
      direction: filters.sortOrder as "asc" | "desc",
    });
    setCurrentPage(1);
    setIsFilterOpen(false);
    toast.success("Filters applied");
  };

  const handleReset = () => {
    setSearch("");
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      sortBy: "dateJoined",
      sortOrder: "desc",
    });
    setSortConfig({ key: "dateJoined", direction: "desc" });
    setCurrentPage(1);
    fetchCustomers({ page: 1, limit: 10 });
    toast.info("Filters reset");
  };

  const handleEdit = (id: string) => {
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      toast.error("Invalid customer ID");
      return;
    }
    router.push(`/customers/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      toast.error("Invalid customer ID");
      return;
    }
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(`/customers/${id}`);
        fetchCustomers({
          page: currentPage,
          limit: 10,
          search,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        });
        toast.success("Customer deleted successfully!");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete customer"
        );
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
          placeholder="Search by name/email/phone"
          value={search}
          onChange={handleSearch}
          className="w-full sm:w-1/3 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          aria-label="Search customers"
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {selectedCustomers.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              aria-label="Delete selected customers"
            >
              Delete Selected ({selectedCustomers.length})
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
                <DialogTitle>Filter Customers</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="mt-1 w-full"
                  />
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
                      <SelectItem value="fullname">Name</SelectItem>
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
                    selectedCustomers.length === customers.length &&
                    customers.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all customers"
                />
              </th>
              <th className="p-3 border-b">ID</th>
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
              <th className="p-3 border-b">
                <button
                  onClick={() => handleSort("fullname")}
                  className="flex items-center gap-1 focus:outline-none"
                  aria-label="Sort by name"
                >
                  Name
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
              <th className="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: Customer, index: number) => (
              <tr key={customer._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedCustomers.includes(customer._id)}
                    onCheckedChange={() => handleSelectCustomer(customer._id)}
                    aria-label={`Select customer ${customer.fullname}`}
                  />
                </td>
                <td className="p-3">{(currentPage - 1) * 10 + index + 1}</td>
                <td className="p-3">
                  {new Date(customer.dateJoined).toLocaleDateString()}
                </td>
                <td className="p-3">{customer.fullname}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.phoneNumber || "N/A"}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(customer._id)}
                    className="text-blue-600 hover:underline focus:outline-none"
                    aria-label={`Edit customer ${customer.fullname}`}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(customer._id)}
                    className="text-red-600 hover:underline focus:outline-none"
                    aria-label={`Delete customer ${customer.fullname}`}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {customers.map((customer: Customer, index: number) => (
          <div key={customer._id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={selectedCustomers.includes(customer._id)}
                onCheckedChange={() => handleSelectCustomer(customer._id)}
                aria-label={`Select customer ${customer.fullname}`}
              />
              <span className="font-semibold">
                #{(currentPage - 1) * 10 + index + 1}
              </span>
            </div>
            <p>
              <strong>Name:</strong> {customer.fullname}
            </p>
            <p>
              <strong>Email:</strong> {customer.email}
            </p>
            <p>
              <strong>Phone:</strong> {customer.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Date Joined:</strong>{" "}
              {new Date(customer.dateJoined).toLocaleDateString()}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(customer._id)}
                className="text-blue-600 hover:underline focus:outline-none"
                aria-label={`Edit customer ${customer.fullname}`}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(customer._id)}
                className="text-red-600 hover:underline focus:outline-none"
                aria-label={`Delete customer ${customer.fullname}`}
              >
                🗑️
              </button>
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

export default CustomersPage;
