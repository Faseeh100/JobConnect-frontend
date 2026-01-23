// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Add this experimental configuration
  experimental: {
    // This tells Next.js not to pre-render pages that use dynamic functions like useSearchParams()
    prerenderEarlyExit: false,
  },
  // Optionally, configure specific headers if needed
  async headers() {
    return [
      {
        source: '/apply',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0', // Prevent caching of the apply page
          },
        ],
      },
    ];
  },
};

export default nextConfig;