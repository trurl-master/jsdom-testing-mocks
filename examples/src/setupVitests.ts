// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';
import { vi } from 'vitest';

failOnConsole();

// or with options:
failOnConsole({
  shouldFailOnWarn: false,
});

function useFakeTimers() {
  // vitest doesn't enable performance by default
  vi.useFakeTimers({
    shouldClearNativeTimers: true,
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
}

function useRealTimers() {
  vi.useRealTimers();
}

async function advanceTimersByTime(time: number) {
  await vi.advanceTimersByTimeAsync(time);
}

function fn() {
  return vi.fn();
}

globalThis.runner = {
  name: 'vi',
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  fn,
};
