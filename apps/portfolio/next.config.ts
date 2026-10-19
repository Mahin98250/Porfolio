import type { NextConfig } from "next";

const isStaticExport = process.env.PORTFOLIO_STATIC_EXPORT === "true";
const basePath = process.env.PORTFOLIO_BASE_PATH ?? "";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "avatars.githubusercontent.com" },
];

const nextConfig: NextConfig = isStaticExport
  ? {
      poweredByHeader: false,
      reactStrictMode: true,
      output: "export",
      trailingSlash: true,
      basePath,
      images: {
        remotePatterns,
        unoptimized: true,
      },
    }
  : {
      poweredByHeader: false,
      reactStrictMode: true,
      images: { remotePatterns },
      async headers() {
        return [
          {
            source: "/(.*)",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "X-Frame-Options", value: "DENY" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            ],
          },
        ];
      },
    };

export default nextConfig;
