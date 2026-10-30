/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Document uploads go through a server action; allow files up to 10 MB.
    serverActions: { bodySizeLimit: "11mb" },
    // Requests pass through src/proxy.ts (auth), which has its own 10 MB default.
    proxyClientMaxBodySize: "11mb",
  },
};

export default nextConfig;
