// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Your Vite port (default is 5173)
    strictPort: false, // Allow port fallback if 5173 is busy
    cors: true, // Enable CORS
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});