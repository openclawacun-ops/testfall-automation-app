import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": [
      "next.config.ts",
      "eslint.config.mjs",
      "tsconfig.json",
      "postcss.config.mjs",
      "README.md",
      "AGENTS.md",
      "CLAUDE.md",
    ],
  },
};

export default nextConfig;
