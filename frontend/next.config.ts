// D:\socialadify\frontend\next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Your existing config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Or 'https' if your backend serves images over https in production
        hostname: 'localhost',
        port: '8000', // Specify the port your backend is running on
        pathname: '/static/profile_pics/**', // Be as specific as possible with the path
      },
      // You can add other patterns here if needed for other external image sources
    ],
    // If you were on an older Next.js version, you might use domains:
    // domains: ['localhost'], 
    // But remotePatterns is more secure and flexible.
  },
};

export default nextConfig;
