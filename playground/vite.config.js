import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vitePluginCdnImport from "../dist/index.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    vitePluginCdnImport({
      cdn: [
        {
          name: 'vue',
          type: 'iife',
          url: 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.min.js'
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
