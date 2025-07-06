import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    env: {
      // テスト環境用の環境変数を設定
      DATABASE_URL: "postgresql://postgres:password@localhost:5433/appdb_test",
      NODE_ENV: "test",
      NEXTJS_URL: "http://localhost:3000",
      REVALIDATE_SECRET: "test-secret-key-12345",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
