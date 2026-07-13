import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import devApiPlugin from './vite-plugin-dev-api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
