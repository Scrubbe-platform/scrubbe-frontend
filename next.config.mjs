/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  //  images: {
  //   loader: 'custom',
  //   loaderFile: './Imageloader.js',
  // }, 
  /* output: 'export' */
};

export default nextConfig;
