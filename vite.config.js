import { defineConfig } from 'vite'

export default defineConfig({
  root: './vanilla',
  publicDir: '../public',
  build: {
    outDir: '../dist-vanilla',
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    open: true,
  },
})
