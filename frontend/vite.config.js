import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    // ONLY use @vitejs/plugin-react - no dev-only plugins
    plugins: [
      react({
        // Disable Fast Refresh in production to prevent eval
        fastRefresh: !isProduction,
      })
    ],
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
      // CRITICAL: Use es2018 for better CSP compatibility
      target: 'es2018',
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: false,
          drop_debugger: true,
          // CRITICAL: Prevent Terser from using eval
          evaluate: false,
          unsafe: false,
          unsafe_comps: false,
          unsafe_math: false,
          unsafe_methods: false,
          unsafe_proto: false,
          unsafe_regexp: false,
          unsafe_undefined: false,
        },
        format: {
          comments: false,
        },
        // Prevent Function constructor usage
        ecma: 2018,
      } : {},
      rollupOptions: {
        output: {
          format: 'es',
          // Prevent code splitting that might use eval
          manualChunks: undefined,
        },
      },
      // CRITICAL: Disable source maps in production to avoid eval
      sourcemap: false,
      // Ensure no dev-only code in production
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    esbuild: {
      legalComments: 'none',
      // Use ES2018 to avoid Function constructor
      target: 'es2018',
      // Prevent eval usage
      format: 'esm',
    },
    // Define process.env for production
    define: isProduction ? {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify('production'),
    } : {},
    // Optimize dependencies - Chart.js is CSP-safe
    optimizeDeps: {
      include: ['chart.js', 'react-chartjs-2'],
      esbuildOptions: {
        target: 'es2018',
      },
    },
  };
})


