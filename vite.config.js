import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // ← Import path module

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ← Ito ang import alias
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['pdfkit', 'blob-stream'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/pdfkit/, /blob-stream/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          pdfkit: ['pdfkit'],
          'blob-stream': ['blob-stream']
        }
      }
    }
  }
});
