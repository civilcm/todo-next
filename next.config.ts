import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Set by the GitHub Pages workflow ("/todo-next"); empty for local dev.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
