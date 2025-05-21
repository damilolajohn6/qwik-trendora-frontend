/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

// Define a more specific error type
type RegistrationError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

// Define Avatar interface to match UserRegistrationData
interface Avatar {
  public_id: string | null;
  url: string | null;
}

async function uploadToCloudinary(file: File): Promise<Avatar> {
  console.warn(
    "Cloudinary upload simulation: In a real app, implement actual upload logic here."
  );
  // Simulate an upload delay and return a mock Avatar object
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    public_id: `mock_public_id_${file.name}`,
    url: `https://res.cloudinary.com/dilhmmvz6/image/upload/v1234567890/${file.name}`,
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phoneNumber: "",
    username: "",
    role: "staff" as "staff" | "manager" | "admin",
    avatar: { public_id: null, url: null } as Avatar,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
      setFormData({ ...formData, avatar: { public_id: null, url: null } });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalAvatar: Avatar = formData.avatar;

    if (avatarFile) {
      try {
        toast.info("Uploading avatar...", { duration: 1500 });
        const uploadResponse = await uploadToCloudinary(avatarFile);
        finalAvatar = uploadResponse;
      } catch (uploadError: any) {
        toast.error("Avatar Upload Failed", {
          description:
            uploadError.message || "Could not upload avatar. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSubmit = {
      ...formData,
      avatar: finalAvatar,
    };

    try {
      await register(dataToSubmit);
      toast.success("Registration Successful", {
        description: "Please verify your email!",
      });
    } catch (error: unknown) {
      const err = error as RegistrationError;
      toast.error("Registration Failed", {
        description:
          err.response?.data?.message || err.message || "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            Register New User (Staff/Admin/Manager)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="avatarFile">Avatar</Label>
              <Input
                id="avatarFile"
                name="avatarFile"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarPreview && (
                <div className="mt-2">
                  <Image
                    src={avatarPreview}
                    alt="Avatar Preview"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
