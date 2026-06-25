import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

let prodConfig = {};

if (process.env.NODE_ENV === "production") {
  prodConfig = {
    output: "export", // Tells Next.js to generate static files in the /out directory
    basePath: "/tmendesilva.github.io",
    images: {
      unoptimized: true, // Required because Next.js default image optimization needs a server
    },
  };
}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  ...prodConfig,
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
