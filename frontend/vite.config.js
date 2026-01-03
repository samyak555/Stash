import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        // Prevent Terser from using eval
        evaluate: false,
        unsafe: false,
      },
      format: {
        comments: false,
      },
      // Prevent Function constructor usage
      ecma: 2020,
    },
    rollupOptions: {
      output: {
        format: 'es',
        strict: false, // Allow some flexibility for Recharts
        // Prevent code splitting that might use eval
        manualChunks: undefined,
      },
    },
    // Disable source maps to avoid eval
    sourcemap: false,
  },
  esbuild: {
    legalComments: 'none',
    // Use ES2020 to avoid Function constructor
    target: 'es2020',
  },
  // Optimize dependencies to avoid eval
  optimizeDeps: {
    include: ['recharts'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
})


