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
      type: 'importmap',
      cdn: [
        {
          name: 'vue',
          type: 'esm',
          url: 'https://unpkg.com/vue@3.2.31/dist/vue.esm-browser.js'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
