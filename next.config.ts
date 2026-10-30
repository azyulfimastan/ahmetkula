import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1024, 1440, 1920, 2560, 3840],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "gsap"],
  },
};

export default withNextIntl(nextConfig);
