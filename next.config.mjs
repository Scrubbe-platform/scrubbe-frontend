/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@calcom/embed-react", "@calcom/embed-core"],
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });
    // @splinetool/runtime lazy-loads its boolean-ops and Draco decoder
    // assets via `new URL(path, import.meta.url)`. Those files aren't
    // shipped in the npm package (they're only present when served from
    // Spline's own CDN), so letting webpack statically resolve the URL
    // fails the whole build even for scenes that never use those features.
    // Disabling static URL resolution leaves it as a runtime-only URL,
    // which only 404s if a scene actually needs one of those lazy modules.
    config.module.rules.push({
      test: /@splinetool[\\/]runtime/,
      parser: { url: false },
    });
    return config;
  },
  //  images: {
  //   loader: 'custom',
  //   loaderFile: './Imageloader.js',
  // }, 
  /* output: 'export' */
};

export default nextConfig;
