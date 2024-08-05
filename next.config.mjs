// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['via.placeholder.com','firebasestorage.googleapis.com'], 
    },
    async rewrites() {
      return [
        {
          source: '/api/resources',
          destination: '/api/resources/route',
        },
      ];
    }
  };
  
  export default nextConfig;
  