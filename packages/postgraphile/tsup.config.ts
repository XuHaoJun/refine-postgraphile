import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  external: [
    // Node.js built-ins that shouldn't be bundled
    "ws",
    // GraphQL WebSocket library
    "graphql-ws",
    // Peer dependencies
    "@refinedev/core",
    "graphql-request",
    "gql-query-builder",
    "graphql-ws",
  ],
  target: "node16",
  sourcemap: true,
  // Split chunks to reduce bundle size
  splitting: false,
  // Minify for production
  minify: false, // Keep readable for debugging
  // Tree shaking
  treeshake: true,
});
