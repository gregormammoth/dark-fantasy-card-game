import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const packagesRoot = path.resolve(__dirname, '../../packages');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dark-fantasy/shared': path.resolve(packagesRoot, 'shared/src'),
      '@dark-fantasy/content': path.resolve(packagesRoot, 'content/src'),
      '@dark-fantasy/game-engine': path.resolve(packagesRoot, 'game-engine/src'),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
  },
});
