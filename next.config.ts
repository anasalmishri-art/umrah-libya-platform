import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // دعم الصور الخارجية
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // ===== رؤوس الأمان =====
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // منع Clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // منع MIME Sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // سياسة Referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS - إجبار HTTPS
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://wa.me",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // X-DNS-Prefetch-Control
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
  },
};

export default nextConfig;
