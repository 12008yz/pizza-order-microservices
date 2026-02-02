/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Не падать на ESLint при сборке (Docker/Render); линт можно гонять локально
  eslint: { ignoreDuringBuilds: true },

  // Оптимизации производительности
  swcMinify: true, // Используем SWC для минификации (быстрее чем Terser)
  compress: true, // Включаем gzip сжатие

  // Оптимизация изображений
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Оптимизация сборки
  // experimental: {
  //   optimizeCss: true, // Оптимизация CSS - отключено, требует critters
  // },

  // Webpack оптимизации
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Оптимизация для клиентской части
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25, // Увеличиваем лимит для лучшего code splitting
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Выделяем React в отдельный чанк (высший приоритет)
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              chunks: 'all',
              priority: 50,
              enforce: true,
            },
            // Выделяем Phosphor Icons в отдельный чанк
            phosphor: {
              name: 'phosphor-icons',
              test: /[\\/]node_modules[\\/]@phosphor-icons[\\/]/,
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            // Выделяем Next.js в отдельный чанк
            nextjs: {
              name: 'nextjs',
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              chunks: 'all',
              priority: 35,
            },
            // Остальные vendor библиотеки
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              minChunks: 1,
            },
          },
        },
      };
    }
    return config;
  },

  // Переменные окружения доступны напрямую через process.env в API routes
  // NEXT_PUBLIC_ переменные доступны на клиенте
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Долгое кэширование только для статики Next.js (JS/CSS чанки)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

