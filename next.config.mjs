/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: import.meta.dirname,
    },
  },

  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
};

export default nextConfig;