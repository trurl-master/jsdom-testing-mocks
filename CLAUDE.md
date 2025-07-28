# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

jsdom-testing-mocks is a TypeScript library that provides browser API mocks for testing in jsdom environments. It supports Jest, Vitest, and @swc/jest testing frameworks.

## Core Mocks

The library provides mocks for these browser APIs:
- **Intersection Observer API** (`src/mocks/intersection-observer.ts`)
- **Resize Observer API** (`src/mocks/resize-observer.ts`) 
- **Web Animations API** (`src/mocks/web-animations-api/`)
- **matchMedia/viewport** (`src/mocks/viewport.ts`)
- **CSS Typed OM** (`src/mocks/css-typed-om/`)
- **Size utilities** (`src/mocks/size/`)

## Development Commands

```bash
# Build the library
npm run build

# Watch mode for development  
npm run watch

# Run all tests
npm test

# Run specific test suites
npm run test:jest     # Jest tests
npm run test:vi       # Vitest tests (excludes .browser.test.ts)
npm run test:swc      # SWC Jest tests
npm run test:browser  # Browser tests with Playwright
npm run test:main     # Jest + Vitest + SWC in sequence

# Test examples
npm run test:examples

# Linting and type checking
npm run lint
npm run typecheck
```

## Testing Architecture

The project uses multiple testing strategies:

1. **Unit Tests** (`.test.ts`) - Run in jsdom with Jest/Vitest
2. **Environment Tests** (`.env.test.ts`) - Test framework-specific behavior
3. **Browser Tests** (`.browser.test.ts`) - Run in real browsers via Playwright

### Test Configurations

- `jest.config.ts` - Main Jest config with ts-jest preset
- `swcjest.config.js` - SWC-based Jest config for faster compilation
- `vitest.config.ts` - Vitest config excluding browser tests
- `vitest.browser.config.ts` - Browser tests with Playwright provider

### Running Single Tests

```bash
# Jest single test
npx jest path/to/test.test.ts

# Vitest single test  
npx vitest path/to/test.test.ts

# Browser test
npx vitest --config vitest.browser.config.ts path/to/test.browser.test.ts
```

## Code Architecture

### Main Entry Point
`src/index.ts` - Exports all public APIs from individual mock modules

### Mock Structure
Each mock follows this pattern:
- Main implementation file (`{name}.ts`)
- Unit tests (`{name}.test.ts`) 
- Environment-specific tests (`{name}.env.test.ts`)
- Browser tests (`{name}.browser.test.ts` where applicable)

### Web Animations API
Most complex mock with multiple files:
- `Animation.ts`, `KeyframeEffect.ts`, `DocumentTimeline.ts` - Core classes
- `cssNumberishHelpers.ts` - Type conversion utilities
- `easingFunctions.ts` - Animation easing support
- `elementAnimations.ts` - Element-specific animation tracking

## Build Configuration

- **tsup** for dual CJS/ESM builds
- **TypeScript** with strict mode enabled
- **ESLint** with TypeScript rules
- **Prettier** for code formatting

## Key Dependencies

- `bezier-easing` - Animation easing functions
- `css-mediaquery` - Media query parsing
- `puppeteer` - Browser automation for tests