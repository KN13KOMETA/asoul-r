import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: { include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"] },
});
