import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    resolve: { alias: { '@shared': resolve(__dirname, 'src/shared'), '@main': resolve(__dirname, 'src/main') } },
    build: { outDir: 'out/main', lib: { entry: 'src/main/index.ts' }, rollupOptions: { external: ['electron'] } }
  },
  preload: {
    resolve: { alias: { '@shared': resolve(__dirname, 'src/shared') } },
    build: { outDir: 'out/preload', lib: { entry: 'src/preload/index.ts' }, rollupOptions: { external: ['electron'] } }
  },
  renderer: {
    root: 'src/renderer',
    resolve: { alias: { '@': resolve(__dirname, 'src/renderer/src'), '@shared': resolve(__dirname, 'src/shared') } },
    plugins: [vue()],
    build: { outDir: 'out/renderer', rollupOptions: { input: { index: resolve(__dirname, 'src/renderer/index.html') } } }
  }
})
