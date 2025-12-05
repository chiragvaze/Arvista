import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        gallery: './gallery.html',
        about: './about.html',
        contact: './contact.html'
      }
    }
  }
});
