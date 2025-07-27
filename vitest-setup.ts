import { vi } from 'vitest';

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

function spyOn(...args: Parameters<typeof vi.spyOn>) {
  return vi.spyOn(...args);
}

globalThis.runner = {
  name: 'vi',
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  fn,
  spyOn,
};
