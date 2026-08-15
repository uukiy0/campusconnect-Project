import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': 'http://localhost:4001',
      '/api/events': 'http://localhost:4002',
      '/api/bookings': 'http://localhost:4003'
    }
  }
});
