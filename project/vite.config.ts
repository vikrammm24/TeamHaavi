import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Use a relative base so built assets resolve correctly in Capacitor (android asset scheme)
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // listen on all addresses, enables LAN access
    port: 5173,
    strictPort: false, // allow Vite to pick a free port if 5173 is busy
    allowedHosts: true, // allow any reverse-proxied/tunnel host like *.loca.lt, *.ngrok.io
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
