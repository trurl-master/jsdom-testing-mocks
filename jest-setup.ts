function useFakeTimers() {
  jest.useFakeTimers();
  globalThis.runner.isFakeTimersActive = true;
}

function useRealTimers() {
  jest.useRealTimers();
  globalThis.runner.isFakeTimersActive = false;
}

async function advanceTimersByTime(time: number) {
  jest.advanceTimersByTime(time);
}

function fn() {
  return jest.fn();
}

// Smart proxy that only implements what we need
function createSmartSpy(realSpy: unknown) {
  return new Proxy(realSpy as object, {
    get(target, prop) {
      // Only implement the methods we actually use
      if (prop === 'mockImplementation') {
        return (fn: () => void) => {
          (target as { mockImplementation: (fn: () => void) => unknown }).mockImplementation(fn);
          return createSmartSpy(target);
        };
      }
      if (prop === 'toHaveBeenCalledWith') {
        return (target as { toHaveBeenCalledWith: (...args: unknown[]) => unknown }).toHaveBeenCalledWith.bind(target);
      }
      if (prop === 'mockRestore') {
        return (target as { mockRestore: () => void }).mockRestore.bind(target);
      }
      
      // For everything else, just pass through to the real spy
      return (target as Record<string | symbol, unknown>)[prop];
    }
  });
}

function spyOn<T extends object, K extends keyof T>(object: T, method: K) {
  const realSpy = jest.spyOn(object, method as never);
  return createSmartSpy(realSpy);
}

globalThis.runner = {
  name: 'jest',
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  fn,
  spyOn,
  isFakeTimersActive: false,
};
