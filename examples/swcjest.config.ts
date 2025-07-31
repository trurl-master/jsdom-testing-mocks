export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      // This is needed to make swc/jest work with React 18 in github actions
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', '<rootDir>/src/test-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '.*\\.browser\\.test\\.ts$'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};