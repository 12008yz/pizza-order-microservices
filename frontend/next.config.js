/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Переменные окружения доступны напрямую через process.env в API routes
  // NEXT_PUBLIC_ переменные доступны на клиенте
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'viewport',
            value: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

