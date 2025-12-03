import { defineConfig } from 'vite'

export default defineConfig({
  root: './vanilla',
  publicDir: '../public',
  build: {
    outDir: '../dist-vanilla',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './vanilla/index.html',
        gallery: './vanilla/gallery.html',
      },
    },
  },
  server: {
    port: 3001,
    open: true,
  },
})
