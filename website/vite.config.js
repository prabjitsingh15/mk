import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite development configuration for the BareAya storefront.
// It enables the React plugin and proxies frontend API requests to the backend server.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
