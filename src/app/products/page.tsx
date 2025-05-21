"use client";
import { useEffect, useState } from "react";
import { useProductStore } from "@/lib/stores/productStore";
import { useAuthStore } from "@/lib/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiUpload,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiRefreshCw,
  FiEdit2,
} from "react-icons/fi";

const ProductsPage = () => {
  const {
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
    deleteProduct,
    bulkDeleteProducts,
    updateProduct,
  } = useProductStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || !["admin", "manager"].includes(user.role)) {
      router.push("/auth/login");
      return;
    }

    fetchProducts({
      page: currentPage,
      search,
      category,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    });
  }, [currentPage, search, category, priceRange, user, router, fetchProducts]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search,
      category,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    });
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
    fetchProducts({ page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product to delete.");
      return;
    }
    if (confirm("Are you sure you want to delete the selected products?")) {
      await bulkDeleteProducts(selectedProducts);
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Category", "Price", "Stock", "Status", "Published"],
      ...products.map((product) => [
        product.name,
        product.category,
        product.price,
        product.stock,
        product.status,
        product.published ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert("Import functionality placeholder. File: " + file.name);
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    await updateProduct(id, { published: !published });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Products</h1>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FiDownload className="mr-2" /> Export
          </button>
          <label className="flex items-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
            <FiUpload className="mr-2" /> Import
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleBulkDelete}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
          <Link href="/products/add">
            <button className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              <FiPlus className="mr-2" /> Add Product
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded flex-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home</option>
            <option value="beauty">Beauty</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: e.target.value })
              }
              className="px-3 py-2 border rounded w-24 md:w-32"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: e.target.value })
              }
              className="px-3 py-2 border rounded w-24 md:w-32"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <FiFilter className="mr-2" /> Filter
            </button>
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              <FiRefreshCw className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 p-4 bg-red-50 rounded">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          setSelectedProducts(
                            e.target.checked
                              ? products.map((product) => product._id)
                              : []
                          )
                        }
                        checked={
                          selectedProducts.length === products.length &&
                          products.length > 0
                        }
                      />
                    </th>
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left hidden sm:table-cell">
                      Category
                    </th>
                    <th className="border p-2 text-left">Price</th>
                    <th className="border p-2 text-left hidden sm:table-cell">
                      Stock
                    </th>
                    <th className="border p-2 text-left hidden md:table-cell">
                      Status
                    </th>
                    <th className="border p-2 text-left hidden md:table-cell">
                      Published
                    </th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="border p-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </td>
                      <td className="border p-2">{product.name}</td>
                      <td className="border p-2 hidden sm:table-cell">
                        {product.category}
                      </td>
                      <td className="border p-2">
                        ₦{product.price.toLocaleString()}
                      </td>
                      <td className="border p-2 hidden sm:table-cell">
                        {product.stock}
                      </td>
                      <td className="border p-2 hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="border p-2 hidden md:table-cell">
                        <button
                          onClick={() =>
                            togglePublish(product._id, product.published)
                          }
                          className={`w-12 h-6 rounded-full p-1 ${
                            product.published ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              product.published ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </td>
                      <td className="border p-2">
                        <div className="flex space-x-2">
                          <Link href={`/products/edit/${product._id}`}>
                            <button className="text-blue-500 hover:text-blue-700">
                              <FiEdit2 />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {products.length} of {pagination.totalItems} products
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
