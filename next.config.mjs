/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: import.meta.dirname,
    },
  },

  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;