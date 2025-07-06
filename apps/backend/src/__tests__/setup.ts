import { afterAll, beforeAll, beforeEach } from "vitest";
import { closeTestDatabase, resetTestDatabase, setupTestDatabase } from "../lib/test-database.js";

// 全テスト開始前の初期化
beforeAll(async () => {
  console.log("🔧 Setting up test environment...");
  await setupTestDatabase();
});

// 全テスト終了後のクリーンアップ
afterAll(async () => {
  console.log("🧹 Cleaning up test environment...");
  await closeTestDatabase();
});

// 各テストケース前のデータベースリセット
beforeEach(async () => {
  await resetTestDatabase();
});
