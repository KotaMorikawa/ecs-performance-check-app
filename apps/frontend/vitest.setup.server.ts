import { vi } from 'vitest';

// Node環境用のsetup（最小限）

// fetch のグローバルモック
global.fetch = vi.fn();

// console のモック（必要に応じて）
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};