import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const DEFAULT_API_PROXY_TARGET = 'http://localhost:4000'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' loads every variable, not only VITE_-prefixed ones: API_PROXY_TARGET is for this dev server
  // only and must never be exposed to browser code.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Mirrors vercel.json in development: the app calls /api/v1 on its own origin and the dev
      // server forwards it to the API. Same-origin means no CORS and the SameSite=strict refresh
      // cookie works exactly as in production. API_PROXY_TARGET picks the API — the local one by
      // default, or e.g. https://northcut-backend.onrender.com to test against the deployed API.
      // See CLAUDE.md → "API base URL & proxy".
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || DEFAULT_API_PROXY_TARGET,
          // Sends the target's own Host header — required by hosts like Render.
          changeOrigin: true,
        },
      },
    },
  }
})
