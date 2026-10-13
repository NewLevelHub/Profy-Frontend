import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Translation catalogs are lazy chunks (shared/i18n/index.ts), so nothing
// would fetch them before the entry runs. Russian is needed on every visit —
// the default locale and Kazakh's fallback — so it is modulepreloaded next to
// the entry. Kazakh is preloaded by public/locale-init.js, only for someone
// who chose it, from the address this plugin puts into a <meta>.
function preloadCatalogs(): Plugin {
  return {
    name: 'profy:preload-catalogs',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const chunks = Object.values(ctx.bundle ?? {});
        const file = (name: string) => chunks.find((c) => c.type === 'chunk' && c.name === name)?.fileName;
        const ru = file('i18n-ru');
        const kk = file('i18n-kk');
        return [
          ...(ru ? [{ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: true, href: `/${ru}` }, injectTo: 'head' as const }] : []),
          ...(kk ? [
            { tag: 'meta', attrs: { name: 'profy-kk-catalog', content: `/${kk}` }, injectTo: 'head' as const },
            // async: a parser-blocking script here would wait for the Google
            // Fonts stylesheet above it (~350 ms) before it could start the fetch.
            { tag: 'script', attrs: { async: true, src: '/locale-init.js' }, injectTo: 'head' as const },
          ] : []),
        ];
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadCatalogs(),
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
