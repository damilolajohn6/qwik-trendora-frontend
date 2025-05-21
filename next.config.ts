import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "via.placeholder.com",
      "cdn.pixabay.com",
      "www.gravatar.com",
      "avatars.githubusercontent.com",
    ],
  },
};

export default nextConfig;
