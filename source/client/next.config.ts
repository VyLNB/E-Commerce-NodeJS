import type { NextConfig } from "next";

const internalHostname = process.env.INTERNAL_API_BASE_URL
  ? new URL(process.env.INTERNAL_API_BASE_URL).hostname
  : "api"; // 'api' là tên service docker

const publicHostname = process.env.NEXT_PUBLIC_API_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).hostname
  : "localhost"; // 'localhost' cho trình duyệt

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: internalHostname, // 'api host'
        port: "5000",
        pathname: "/publics/**",
      },
      // Cho phép client-side (trình duyệt) fetch từ 'localhost:5000'
      {
        protocol: "http",
        hostname: publicHostname, // 'localhost'
        port: "5000",
        pathname: "/publics/**",
      },
      // CHO PHÉP AVATAR MẶC ĐỊNH
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
        port: "", // Port mặc định (443 cho https)
        pathname: "/username/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ttyglzzufhlgbbukhtxx.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
