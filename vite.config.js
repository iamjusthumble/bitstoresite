import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lensLogin: resolve(import.meta.dirname, 'lens/login/index.html'),
        giftCards: resolve(import.meta.dirname, 'gift-cards/index.html'),
      },
    },
  },
});
