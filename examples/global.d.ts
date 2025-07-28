/// <reference types="vite/client" />

declare global {
  var runner: {
    name: 'vi' | 'jest';
    useFakeTimers: () => void;
    useRealTimers: () => void;
    advanceTimersByTime: (time: number) => Promise<void>;
    fn: () => jest.Mock | ReturnType<typeof vi.fn>;
  };
}

export {};