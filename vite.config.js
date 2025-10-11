// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // <-- Impor modul 'path' dari Node.js

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Tentukan direktori output build di sini
    outDir: "/var/www/pks-frontend",
    rollupOptions: {
      external: ["fsevents"],
    },

    // Opsi ini akan membersihkan direktori output sebelum setiap build
    emptyOutDir: true,
  },
});
