// D:\socialadify\frontend\next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing reactStrictMode setting
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000', // Important: specify the port your backend is running on
        pathname: '/static/**', // Allows any path under /static/, good for profile_pics and scheduled_post_images
      },
      {
        // This pattern is for the placeholder images we've used
        protocol: 'https',
        hostname: 'placehold.co',
        port: '', // Default port for https (443)
        pathname: '/**', // Allow any path on placehold.co
      },
      // You can add more patterns here if you use images from other external domains
    ],
  },
  // Any other Next.js configurations you might have...
};

export default nextConfig;
