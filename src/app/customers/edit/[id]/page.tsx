/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import axios from "@/lib/utils/api";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

interface Customer {
  _id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  avatar: { public_id: string | null; url: string | null };
}

const EditCustomerPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Validate id and fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        // Validate id format (should be a 24-character hex string for MongoDB ObjectId)
        if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error("Invalid customer ID");
        }

        const response = await axios.get(`/customers/${id}`);
        const customerData = response.data.data;
        setCustomer(customerData);
        setFormData({
          fullname: customerData.fullname,
          email: customerData.email,
          phoneNumber: customerData.phoneNumber || "",
          avatar: customerData.avatar?.url || "",
        });
        setIsLoading(false);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch customer details"
        );
        router.push("/customers");
      }
    };

    if (isAuthenticated) {
      fetchCustomer();
    }
  }, [id, isAuthenticated, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedFormData = { ...formData };

      // If a new file is selected, upload it to Cloudinary
      if (selectedFile) {
        try {
          const uploadedUrl = await uploadImageToCloudinary(selectedFile);
          updatedFormData.avatar = uploadedUrl;
        } catch (error: any) {
          toast.error(error.message || "Failed to upload image to Cloudinary");
          setIsSubmitting(false);
          return;
        }
      }

      // Submit the updated customer data
      await axios.put(`/customers/${id}`, updatedFormData);
      toast.success("Customer updated successfully!");
      router.push("/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger file input click
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  if (isLoading || !customer) {
    return <p className="text-center text-lg text-gray-700 p-6">Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Edit Customer
      </h1>
      <Card className="p-4 sm:p-6 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="mt-1 w-full"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor="avatar-upload"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Image
            </label>
            <div className="mt-1 flex flex-col items-center">
              {/* Hidden file input */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                aria-label="Upload profile image"
              />
              {/* Choose File Button */}
              <Button
                type="button"
                onClick={handleChooseFile}
                className="bg-blue-600 text-white hover:bg-blue-700 mb-2"
                disabled={isSubmitting}
              >
                Choose File
              </Button>
              {/* Display selected file name */}
              {selectedFile && (
                <p className="text-sm text-gray-600 mb-2">
                  {selectedFile.name}
                </p>
              )}
              {/* Image Preview */}
              <div className="flex justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="New Avatar Preview"
                    className="w-24 h-24 rounded-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : formData.avatar ? (
                  <Image
                    src={formData.avatar}
                    alt="Current Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/customers")}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 hover:bg-gray-300"
              aria-label="Cancel editing"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
              aria-label="Save changes"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditCustomerPage;
