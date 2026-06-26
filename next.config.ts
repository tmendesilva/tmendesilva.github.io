import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

let prodConfig = {};

if (process.env.NODE_ENV === "production") {
  prodConfig = {
    output: "export", // Keeps static export enabled

    // Replace 'your-repository-name' with your EXACT GitHub repository name
    basePath: "/tmendesilva.github.io",

    // Required so Next.js knows where to find static assets (CSS, JS)
    assetPrefix: "/tmendesilva.github.io/",

    // Next.js default image optimization requires a running Node.js server.
    // This must be disabled for completely static hosting platforms like GitHub Pages.
    images: {
      unoptimized: true,
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
