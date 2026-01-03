import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const appVersion = packageJson.version || '0.0.1'

// Plugin to inject version into HTML
const injectVersionPlugin = () => {
  return {
    name: 'inject-version',
    transformIndexHtml(html) {
      // Inject version as meta tag and data attribute
      return html.replace(
        '<head>',
        `<head>\n    <meta name="app-version" content="${appVersion}">\n    <meta name="build-time" content="${Date.now()}">`
      )
    },
  }
}

// https://vitejs.dev/config/
// CRITICAL: Using SWC plugin instead of Babel - no eval usage
export default defineConfig({
  plugins: [react(), injectVersionPlugin()],
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
    sourcemap: false,
    target: 'es2020',
    // Use esbuild for minification (no eval)
    minify: 'esbuild',
    // Ensure hashed filenames for cache busting (default behavior)
    rollupOptions: {
      output: {
        // Already hashed by default, but being explicit
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Define process.env for production
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
})


