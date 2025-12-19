// @ts-nocheck

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack,
};

export default nextConfig;

/**
 * @param {any} config
 * @param {{ isServer: boolean }} options
 */
function webpack(config, options) {
  const { isServer } = options;

  if (!isServer) {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
      stream: false,
    };
  }

  return config;
}