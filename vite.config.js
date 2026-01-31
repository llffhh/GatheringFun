import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Automatically sets the base path to '/GatheringFun/' on GitHub Pages
    // and '/' for local development.
    base: mode === 'production' ? '/GatheringFun/' : '/',

    server: {
      port: 3000,
      open: true,
      // Ensures the local dev server handles SPA routing correctly
      historyApiFallback: true,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Ensures the old build is cleaned before every new build
      emptyOutDir: true,
      // Optimizes memory usage by splitting the vendor (libraries) code
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore']
          }
        }
      }
    }
  }
})