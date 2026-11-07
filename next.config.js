// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  async redirects() {
    // The Stats page was replaced by the Chat tab; old bookmarks and home-screen links still point to it.
    return [{ source: '/stats', destination: '/chat', permanent: true }];
  },
};

module.exports = withPWA(nextConfig);
