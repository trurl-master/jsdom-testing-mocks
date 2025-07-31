import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Handle client-side routing - fallback to index.html for SPA
    historyApiFallback: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
}); 