/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@calcom/embed-react", "@calcom/embed-core"],
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
