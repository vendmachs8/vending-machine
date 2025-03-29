import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Dengarkan semua interface
    port: 5001,
    strictPort: true, // Pastikan port 5001 selalu digunakan
    hmr: {
      clientPort: 5001 // Penting untuk HMR di jaringan lokal
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    cors: true // Aktifkan CORS penuh untuk development
  }
});