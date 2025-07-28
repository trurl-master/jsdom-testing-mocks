/// <reference types="vitest" />

// https://vitejs.dev/config/

export default {
  test: {
    globals: true,
    // Don't set environment for browser tests - they run in actual browser
    setupFiles: ['./vitest-setup.ts'],
    include: ['src/**/*.browser.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    browser: {
        provider: 'playwright',
        enabled: true,
        headless: true,
        screenshot: 'off',
        instances: [
            { browser: 'chromium' },
        ],
    },
  },
}; 