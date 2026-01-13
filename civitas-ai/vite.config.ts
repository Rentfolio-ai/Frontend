import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001', // DataLayer backend (change to 8000 if needed)
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        configure: (proxy) => {
          // Suppress noisy WebSocket errors during backend restarts
          proxy.on('error', (err) => {
            if (err.message.includes('ECONNRESET') || err.message.includes('ECONNREFUSED')) {
              // Silent handling - backend is restarting
              return;
            }
            console.error('[proxy error]', err.message);
          });
        },
      },
    },
  },
})
