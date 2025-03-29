import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Ini akan memungkinkan akses dari jaringan
    port: 5001, // Port yang digunakan
  },
});

