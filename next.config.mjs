/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: import.meta.dirname,
    },
  },

  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  outputFileTracingIncludes: {
    "/api/nota/[id]/pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
};

export default nextConfig;