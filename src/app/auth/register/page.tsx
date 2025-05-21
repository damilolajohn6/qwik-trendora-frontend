
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

// Define a more specific error type, similar to LoginPage
type RegistrationError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

async function uploadToCloudinary(file: File): Promise<{ url: string }> {
  console.warn(
    "Cloudinary upload simulation: In a real app, implement actual upload logic here."
  );
  // Simulate an upload delay and return a mock URL
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // Replace with actual Cloudinary URL structure after upload
  return {
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
    avatar: "",
    username: "",
    role: "staff" as "staff" | "manager" | "admin",
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
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalAvatarUrl = formData.avatar;

    if (avatarFile) {
      try {
        toast.info("Uploading avatar...", { duration: 1500 });
        const uploadResponse = await uploadToCloudinary(avatarFile);
        finalAvatarUrl = uploadResponse.url;
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
      avatar: finalAvatarUrl,
    };

    try {
      await register(dataToSubmit); // Pass only the data object
      toast.success("Registration Successful", {
        description: "Please verify your email!",
      });
      // router.push("/dashboard"); // Moved to useEffect
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Register New User (Staff/Admin/Manager)</CardTitle>
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
            {/* Optionally, you might want to show formData.avatar if it's an existing URL being edited */}
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded block" // Added block display
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
