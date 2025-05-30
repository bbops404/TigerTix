import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactSWC from '@vitejs/plugin-react-swc';
import path from "path"; // ← Import path module

export default defineConfig({
  plugins: [react(), reactSWC()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ← Ito ang import alias
      'react': 'react',
      'react-dom': 'react-dom',
      'use-sync-external-store': 'use-sync-external-store/shim'
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
      include: [/pdfkit/, /blob-stream/, /node_modules/],
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
