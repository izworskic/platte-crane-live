import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  poweredByHeader: false,
  basePath: '/national-tools/platte-crane-live',
  allowedDevOrigins: ['127.0.0.1'],
  images: { remotePatterns: [] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ] }];
  }
};
export default nextConfig;
