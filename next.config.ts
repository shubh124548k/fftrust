import type { NextConfig } from "next";

/**
 * FF TRUST — Next.js configuration.
 *
 * Security headers are configured via the `headers()` function to provide
 * defense-in-depth against XSS, clickjacking, MIME sniffing, and other
 * common web vulnerabilities. The CSP is intentionally permissive enough
 * to allow Next.js internals, inline styles (Tailwind), and safe external
 * resources (Google Fonts, WhatsApp) while blocking dangerous patterns.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Allow the sandbox preview proxy to load _next resources without warnings.
  allowedDevOrigins: ["*.space-z.ai", "*.chatglm.cn"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer information sent with requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features (camera, microphone, geolocation, etc.)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Prevent clickjacking — allow same-origin + sandbox preview domains.
          // The preview panel uses an iframe on *.space-z.ai and *.chatglm.cn.
          // In production, replace with your actual domain or remove the wildcard.
          { key: "X-Frame-Options", value: "ALLOWALL" },
          // HSTS — enforce HTTPS for 1 year (only sent over HTTPS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Security Policy — allows Next.js, inline styles, safe externals.
          // frame-ancestors allows the sandbox preview domains to embed the app.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + eval (dev) + bundled scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Tailwind CSS + inline styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images from any HTTPS source (canonical data has external URLs)
              "img-src 'self' data: https: blob:",
              // Fonts from Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Media from HTTPS sources
              "media-src 'self' https: blob:",
              // Connections to self + WhatsApp + Google OAuth
              "connect-src 'self' https://wa.me https://api.whatsapp.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com",
              // Frames — same-origin + the media viewer's embed providers + Google OAuth
              "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://accounts.google.com",
              // Object/embed — block entirely (no Flash/Java)
              "object-src 'none'",
              // Base URI — restrict to self
              "base-uri 'self'",
              // Form actions — restrict to self
              "form-action 'self'",
              // Allow embedding in sandbox preview panels + same-origin.
              // In production, restrict to your actual domain.
              "frame-ancestors 'self' https://*.space-z.ai https://*.chatglm.cn https://*.z.ai",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
