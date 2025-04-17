// next.config.js
const nextConfig = {
  reactStrictMode: true, // Helps find potential issues in development
  swcMinify: true, // Enables faster builds with the SWC compiler
  images: {
    domains: ['your-image-domain.com'], // Allow external image sources
  },
  env: {
    // Optional: expose environment variables to the client
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  },
};

module.exports = nextConfig;
