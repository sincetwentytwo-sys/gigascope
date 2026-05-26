// Vitest config — mirrors the @/ alias from tsconfig.json paths so unit
// tests can import modules using the same paths the runtime code does.
//
// Without this, importing "@/data/factories" or any other @/ path errors
// with "Cannot find package '@/data/...'" because vitest's bundler doesn't
// see tsconfig path aliases by default.

import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
