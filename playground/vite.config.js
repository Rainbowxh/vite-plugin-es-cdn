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
          global: 'Vue',
          url: 'https://cdn.bootcdn.net/ajax/libs/vue/3.5.13/vue.global.min.js'
        },
        {
          name: 'element-plus',
          type: 'importmap',
          url: 'https://cdn.jsdelivr.net/npm/element-plus@2.9.6/+esm'
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
