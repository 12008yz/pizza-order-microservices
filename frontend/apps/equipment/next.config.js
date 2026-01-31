/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/equipment',
  transpilePackages: ['@tariff/contexts', '@tariff/api-client', '@tariff/ui'],
};

module.exports = nextConfig;
