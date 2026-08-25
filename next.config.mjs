import path from "node:path";

/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: [
    "@calcom/embed-react",
    "@calcom/embed-core",
    "@splinetool/react-spline",
  ],
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
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.output.webassemblyModuleFilename = isServer
      ? "../static/wasm/[modulehash].wasm"
      : "static/wasm/[modulehash].wasm";

    // @splinetool/react-spline ships a broken `exports` map that Next's
    // webpack resolver can't match against — alias straight to the
    // compiled file to bypass package-export resolution entirely.
    config.resolve.alias["@splinetool/react-spline$"] = path.resolve(
      "./node_modules/@splinetool/react-spline/dist/react-spline.js",
    );

    return config;
  },
};

export default nextConfig;
