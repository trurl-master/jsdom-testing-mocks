function useFakeTimers() {
  jest.useFakeTimers();
}

function useRealTimers() {
  jest.useRealTimers();
}

async function advanceTimersByTime(time: number) {
  jest.advanceTimersByTime(time);
}

function fn() {
  return jest.fn();
}

function spyOn(...args: Parameters<typeof jest.spyOn>) {
  return jest.spyOn(...args);
}

globalThis.runner = {
  name: 'jest',
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  fn,
  spyOn,
};
