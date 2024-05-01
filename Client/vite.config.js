import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10000', // Ensure your backend server is running on this address and port
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
