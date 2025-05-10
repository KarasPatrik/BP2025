import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // your JSON‑fetching API under /api
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Sanctum’s CSRF endpoint
      '/sanctum': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})
