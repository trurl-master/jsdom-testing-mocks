/// <reference types="vitest" />

// https://vitejs.dev/config/
export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    include: ['src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['src/**/*.browser.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  // Browser mode configuration
  browser: {
    enabled: true,
    name: 'chrome',
    headless: true,
  },
};
