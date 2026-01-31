/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const mainUrl = isDev ? 'http://localhost:3001' : (process.env.MAIN_APP_URL || 'http://localhost:3001');
    const equipmentUrl = isDev ? 'http://localhost:3002' : (process.env.EQUIPMENT_APP_URL || 'http://localhost:3002');
    const orderUrl = isDev ? 'http://localhost:3003' : (process.env.ORDER_APP_URL || 'http://localhost:3003');
    return [
      { source: '/', destination: `${mainUrl}/` },
      { source: '/providers', destination: `${mainUrl}/providers` },
      { source: '/equipment', destination: `${equipmentUrl}/equipment` },
      { source: '/equipment/:path*', destination: `${equipmentUrl}/equipment/:path*` },
      { source: '/order', destination: `${orderUrl}/order` },
      { source: '/order/:path*', destination: `${orderUrl}/order/:path*` },
      { source: '/fonts/:path*', destination: `${mainUrl}/fonts/:path*` },
    ];
  },
};

module.exports = nextConfig;
