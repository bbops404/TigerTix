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
      'use-sync-external-store': 'use-sync-external-store'
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['use-sync-external-store'],
    exclude: ['pdfkit', 'blob-stream', 'pdfkit-browserify']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ['pdfkit', 'blob-stream', 'pdfkit-browserify'],
      output: {
        globals: {
          pdfkit: 'PDFKit',
          'blob-stream': 'BlobStream',
          'pdfkit-browserify': 'PDFKitBrowserify'
        }
      }
    }
  }
});
