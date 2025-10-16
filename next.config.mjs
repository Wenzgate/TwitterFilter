/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['pino']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.twimg.com'
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com'
      }
    ]
  }
};

export default nextConfig;
