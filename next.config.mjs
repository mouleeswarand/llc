/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Document uploads go through a server action; allow files up to 10 MB.
    serverActions: { bodySizeLimit: "11mb" },
    // Requests pass through src/proxy.ts (auth), which has its own 10 MB default.
    proxyClientMaxBodySize: "11mb",
  },
  // Browsers remember to use HTTPS only (Vercel already redirects http -> https).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }],
      },
    ];
  },
};

export default nextConfig;
