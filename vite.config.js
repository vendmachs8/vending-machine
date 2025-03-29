import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/', // Base URL harus sesuai dengan root Vercel
  build: {
    outDir: '.', // Output ke root directory (sesuai vercel.json)
    emptyOutDir: true, // Kosongkan directory build sebelumnya
    rollupOptions: {
      input: '/index.html', // Sesuai dengan src di vercel.json
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },
  server: {
    historyApiFallback: true, // Penting untuk SPA routing
    strictPort: true,
    port: 5001 // Sesuaikan dengan port development Anda
  },
  optimizeDeps: {
    include: ['vue'] // Optimasi dependensi Vue
  }
})