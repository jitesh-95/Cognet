/** @type {import('next').NextConfig} */
const nextConfig = {
  // tells Next.js to use the App Router in src/app
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
