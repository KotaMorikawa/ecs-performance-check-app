import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ui.ts'],
    globals: true,
    environmentMatchGlobs: [
      // Server Actions（Node環境）はUIセットアップをスキップ
      ['**/__tests__/*actions*.test.ts', 'node'],
      ['**/__tests__/*server*.test.ts', 'node'],
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
});