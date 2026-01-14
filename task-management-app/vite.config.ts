import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import qiankun from 'vite-plugin-qiankun'
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    qiankun(`task-management`, {  // 子应用的name值
      useDevMode: true
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5175, // 任务管理子应用端口
    cors: true, // 启用跨域
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  base: qiankunWindow.__POWERED_BY_QIANKUN__ ? '/task-management':'/',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'umd',
        name: 'task-management',
        entryFileNames: `static/js/[name].js`,
        assetFileNames: `static/[ext]/[name].[ext]`,
        globals: {
          vue: 'Vue',
        },
      },
    },
  }, 
})
