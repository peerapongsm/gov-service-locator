import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gov-service-locator',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
