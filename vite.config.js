import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "/var/www/pks-frontend",
    rollupOptions: {
      external: ["fsevents"],
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Perbaikan yang lebih kuat untuk dependensi react-router-dom
      'set-cookie-parser': path.resolve(
        __dirname,
        'node_modules/set-cookie-parser/lib/set-cookie.js'
      ),
    },
  },
});
