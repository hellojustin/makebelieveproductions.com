import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing the dev server via 127.0.0.1 in addition to localhost.
  // Without this, Next 16 dev rejects the HMR websocket upgrade and
  // breaks client-component hydration (e.g. the hero canvas stays blank).
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
