import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@dark-fantasy/shared': path.resolve(__dirname, '../shared/src'),
      '@dark-fantasy/content': path.resolve(__dirname, '../content/src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
