import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    rollupOptions: {
      output: {
        // Libraries and translation catalogs change far less often than app
        // code: separate chunks keep their hashes, and the browser cache,
        // across our deploys. Both locales still load up front (i18n/index.ts).
        manualChunks(id) {
          const locale = id.match(/\/src\/shared\/i18n\/locales\/(\w+)\//)?.[1];
          if (locale) return `i18n-${locale}`;
          if (/\/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return 'react';
          if (/\/node_modules\/(@tanstack|axios|i18next|react-i18next|zustand|clsx|tailwind-merge)\//.test(id)) return 'vendor';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    allowedHosts: ['profy.newlevelhub.kz'],
  },
})
