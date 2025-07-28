/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupVitests.ts'],
    include: ['**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
};
