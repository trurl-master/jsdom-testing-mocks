/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/examples/', '.*\\.browser\\.test\\.ts$'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
