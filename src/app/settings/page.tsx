/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import axios from "@/lib/utils/api";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface Settings {
  _id?: string;
  storeName: string;
  storeEmail: string;
  storeContact: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  numberOfImagesPerProduct: number;
  allowAutoTranslation: boolean;
  defaultLanguage: string;
  defaultDateFormat: string;
  enableNewsletter: boolean;
}

const SettingsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState<Settings>({
    storeName: "",
    storeEmail: "",
    storeContact: "",
    storeAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
    numberOfImagesPerProduct: 4,
    allowAutoTranslation: false,
    defaultLanguage: "en",
    defaultDateFormat: "dd/mm/yyyy",
    enableNewsletter: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "admin") {
      toast.error("Only admins can access settings");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/settings", {
          headers: { "Cache-Control": "no-cache" }, // Prevent browser caching
        });
        if (response.status === 200) {
          const data = response.data.data;
          setSettings(data);
          setFormData({
            storeName: data.storeName,
            storeEmail: data.storeEmail,
            storeContact: data.storeContact,
            storeAddress: data.storeAddress,
            numberOfImagesPerProduct: data.numberOfImagesPerProduct,
            allowAutoTranslation: data.allowAutoTranslation,
            defaultLanguage: data.defaultLanguage,
            defaultDateFormat: data.defaultDateFormat,
            enableNewsletter: data.enableNewsletter,
          });
        } else if (response.status === 304) {
          // Handle 304 by refetching without cache
          const retryResponse = await axios.get("/api/settings", {
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          });
          const data = retryResponse.data.data;
          setSettings(data);
          setFormData({
            storeName: data.storeName,
            storeEmail: data.storeEmail,
            storeContact: data.storeContact,
            storeAddress: data.storeAddress,
            numberOfImagesPerProduct: data.numberOfImagesPerProduct,
            allowAutoTranslation: data.allowAutoTranslation,
            defaultLanguage: data.defaultLanguage,
            defaultDateFormat: data.defaultDateFormat,
            enableNewsletter: data.enableNewsletter,
          });
        }
      } catch (error: any) {
        console.error("Fetch settings error:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch settings"
        );
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("storeAddress.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        storeAddress: { ...prev.storeAddress, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.storeEmail)
      ) {
        throw new Error("Please provide a valid email address");
      }
      if (!/^\+?\d{10,15}$/.test(formData.storeContact)) {
        throw new Error("Please provide a valid phone number");
      }
      if (
        formData.numberOfImagesPerProduct < 1 ||
        formData.numberOfImagesPerProduct > 20
      ) {
        throw new Error(
          "Number of images per product must be between 1 and 20"
        );
      }

      await axios.put("/api/settings", formData);
      toast.success("Settings updated successfully!");
      setSettings(formData);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update settings"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !settings) {
    return <p className="text-center text-lg text-gray-700 p-6">Loading...</p>;
  }

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
            Settings
          </h2>
          <div className="flex items-center space-x-2">
            <Image
              src="/placeholder-avatar.jpg" // Replace with actual user avatar URL
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            <span className="text-green-600">Online</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="numberOfImagesPerProduct"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Images per Product
              </Label>
              <Input
                id="numberOfImagesPerProduct"
                name="numberOfImagesPerProduct"
                type="number"
                value={formData.numberOfImagesPerProduct}
                onChange={handleChange}
                className="mt-1 w-full max-w-xs"
                min="1"
                max="20"
                required
                aria-required="true"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="allowAutoTranslation"
                className="text-sm font-medium text-gray-700"
              >
                Allow Auto Translation
              </Label>
              <Switch
                id="allowAutoTranslation"
                checked={formData.allowAutoTranslation}
                onCheckedChange={(checked) =>
                  handleSwitchChange("allowAutoTranslation", checked)
                }
                aria-label="Toggle auto translation"
              />
            </div>
            <div>
              <Label
                htmlFor="defaultLanguage"
                className="block text-sm font-medium text-gray-700"
              >
                Default Language
              </Label>
              <Select
                value={formData.defaultLanguage}
                onValueChange={(value) =>
                  handleSelectChange("defaultLanguage", value)
                }
              >
                <SelectTrigger className="mt-1 w-full max-w-xs">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="defaultDateFormat"
                className="block text-sm font-medium text-gray-700"
              >
                Default Date Format
              </Label>
              <Select
                value={formData.defaultDateFormat}
                onValueChange={(value) =>
                  handleSelectChange("defaultDateFormat", value)
                }
              >
                <SelectTrigger className="mt-1 w-full max-w-xs">
                  <SelectValue placeholder="Select Date Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">dd/mm/yyyy</SelectItem>
                  <SelectItem value="mm/dd/yyyy">mm/dd/yyyy</SelectItem>
                  <SelectItem value="yyyy-mm-dd">yyyy-mm-dd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="enableNewsletter"
                className="text-sm font-medium text-gray-700"
              >
                Enable Newsletter send to Customer by Email
              </Label>
              <Switch
                id="enableNewsletter"
                checked={formData.enableNewsletter}
                onCheckedChange={(checked) =>
                  handleSwitchChange("enableNewsletter", checked)
                }
                aria-label="Toggle newsletter"
              />
            </div>
            <div>
              <Label
                htmlFor="storeName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="mt-1 w-full max-w-xs"
                required
                aria-required="true"
              />
            </div>
            <div>
              <Label
                htmlFor="storeEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="storeEmail"
                name="storeEmail"
                type="email"
                value={formData.storeEmail}
                onChange={handleChange}
                className="mt-1 w-full max-w-xs"
                required
                aria-required="true"
              />
            </div>
            <div>
              <Label
                htmlFor="storeContact"
                className="block text-sm font-medium text-gray-700"
              >
                Contact
              </Label>
              <Input
                id="storeContact"
                name="storeContact"
                value={formData.storeContact}
                onChange={handleChange}
                className="mt-1 w-full max-w-xs"
                required
                aria-required="true"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white hover:bg-green-700"
                aria-label="Update settings"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
