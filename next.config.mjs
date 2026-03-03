/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  //  images: {
  //   loader: 'custom',
  //   loaderFile: './Imageloader.js',
  // }, 
  /* output: 'export' */
};

export default nextConfig;
