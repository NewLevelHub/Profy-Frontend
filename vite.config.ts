import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// The Russian catalog is needed on every first visit — it is the default
// locale and the fallback for Kazakh — but it is a lazy chunk (see
// shared/i18n/index.ts), so nothing would fetch it before the entry runs.
// Preload it next to the entry; the Kazakh one stays on demand.
function preloadRussianCatalog(): Plugin {
  return {
    name: 'profy:preload-ru-catalog',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const chunk = Object.values(ctx.bundle ?? {}).find((c) => c.type === 'chunk' && c.name === 'i18n-ru');
        if (!chunk) return [];
        return [{ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: true, href: `/${chunk.fileName}` }, injectTo: 'head' }];
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadRussianCatalog(),
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
        // across our deploys. One chunk per locale, loaded on demand.
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
