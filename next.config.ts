import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async rewrites() {
    const backend = (process.env.API_INTERNAL_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
    return [{ source: "/api/cms/api/:path*", destination: `${backend}/api/:path*` }];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3002",
        "*.localhost:3002",
        "houseofsenses.vn",
        "*.houseofsenses.vn",
      ],
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3000", pathname: "/**" },
      { protocol: "https", hostname: "admin.houseofsenses.vn", pathname: "/**" },
      { protocol: "https", hostname: "**.houseofsenses.vn", pathname: "/**" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
