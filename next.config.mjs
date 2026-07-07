/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: import.meta.dirname,
    },
  },

  serverExternalPackages: ["pdfkit"],

  outputFileTracingIncludes: {
    "/api/nota/[id]/pdf": [
      "./node_modules/pdfkit/js/data/**/*",
    ],
  },
};

export default nextConfig;