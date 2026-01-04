/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Переменные окружения доступны напрямую через process.env в API routes
  // NEXT_PUBLIC_ переменные доступны на клиенте
}

module.exports = nextConfig

