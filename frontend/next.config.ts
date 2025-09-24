// D:/socialadify/frontend/next.config.ts
import { NextConfig } from 'next';
import { Configuration } from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/static/**',
      },
            {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '', // Default port for https (443)
        pathname: '/**', // Allow all paths under this hostname
      },
      
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // *** THIS IS THE FIX ***
      // We ensure config.externals is an array before trying to push to it.
      if (!config.externals) {
        config.externals = [];
      }
      config.externals.push('canvas');
    }
    return config;
  },
};

export default nextConfig;
