import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/index.ts", "**/*.d.ts"],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      // Handle .js extension mapping
      "^(..?/.+)\\.js?$": "$1",
      "@": "./src",
      "@/dataProvider": "./src/dataProvider",
      "@/liveProvider": "./src/liveProvider",
      "@/utils": "./src/utils",
      "@/types": "./src/types",
    },
  },
  esbuild: {
    target: "node20",
  },
});
