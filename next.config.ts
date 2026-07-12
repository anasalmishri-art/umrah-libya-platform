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
  // ===== رؤوس الأمان المتقدمة (#10, #11, #15) =====
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ===== منع Clickjacking =====
          { key: "X-Frame-Options", value: "DENY" },

          // ===== منع MIME Sniffing =====
          { key: "X-Content-Type-Options", value: "nosniff" },

          // ===== سياسة Referrer =====
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // ===== HSTS مع Preload (#11) =====
          // مدة سنتين + تضمين النطاقات الفرعية + Preload
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // ===== Content Security Policy الصارمة (#10) =====
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // السماح بالسكريبتات من نفس الموقع + Next.js فقط
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              // السماح بالأنماط من Google Fonts + Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // السماح بالخطوط من Google Fonts + data URIs
              "font-src 'self' https://fonts.gstatic.com data:",
              // السماح بالصور من أي مصدر HTTPS + data URIs + blob
              "img-src 'self' data: https: blob:",
              // السماح بالاتصال بـ WhatsApp + Upstash + Vercel Analytics
              "connect-src 'self' https://wa.me https://api.upstash.com wss://vercel.live",
              // السماح بـ frames من Vercel Live فقط (للتطوير)
              "frame-src 'self' https://vercel.live",
              // منع أي frame خارجي
              "frame-ancestors 'none'",
              // قاعدة base من نفس الموقع فقط
              "base-uri 'self'",
              // إرسال النماذج لنفس الموقع فقط
              "form-action 'self'",
              // منع تحميل الكائنات (Flash, Java)
              "object-src 'none'",
              // منع WebAssembly من مصادر خارجية
              "wasm-unsafe-eval",
              // تقييد Worker Sources
              "worker-src 'self' blob:",
              // تقييد Manifest Sources
              "manifest-src 'self'",
              // تقييد prefetch
              "prefetch-src 'self'",
              // إعداد Upgrade-Insecure-Requests
              "upgrade-insecure-requests",
            ].join("; "),
          },

          // ===== Permissions Policy (#15) =====
          // تعطيل كل الصلاحيات الحساسة
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "browsing-topics=()",
              "interest-cohort=()",
              "payment=()",
              "usb=()",
              "bluetooth=()",
              "nfc=()",
              "gyroscope=()",
              "accelerometer=()",
              "magnetometer=()",
              "clipboard-read=()",
              "clipboard-write=(self)",
              "display-capture=()",
              "encrypted-media=()",
              "fullscreen=(self)",
              "picture-in-picture=()",
              "publickey-credentials-get=()",
              "screen-wake-lock=()",
              "sync-xhr=()",
              "web-share=()",
              "xr-spatial-tracking=()",
            ].join(", "),
          },

          // ===== X-DNS-Prefetch-Control =====
          { key: "X-DNS-Prefetch-Control", value: "off" },

          // ===== Cross-Origin Headers (#15) =====
          // منع Spectre/Meltdown
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },

          // ===== X-Permitted-Cross-Domain-Policies =====
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },

          // ===== منع Floc =====
          { key: "Interest-Cohort", value: "()" },
        ],
      },
      // ===== رؤوس خاصة بالملفات المرفوعة =====
      {
        source: "/uploads/(.*).pdf",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Disposition", value: "inline" },
          // منع تنفيذ السكريبت في PDF
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // ===== رؤوس خاصة بالصور =====
      {
        source: "/uploads/(.*).(jpg|jpeg|png|gif|webp)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "default-src 'none'; img-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
