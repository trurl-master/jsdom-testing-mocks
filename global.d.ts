export {};

// Smart proxy type that only implements what we need
interface SmartSpy {
  mockImplementation: (fn: () => void) => SmartSpy;
  toHaveBeenCalledWith: (...args: unknown[]) => void;
  mockRestore: () => void;
  [key: string]: unknown; // For any other properties, will pass through to underlying spy
}

interface Runner {
  name: 'vi' | 'jest';
  useFakeTimers: () => void;
  useRealTimers: () => void;
  advanceTimersByTime: (time: number) => Promise<void> | void;
  /** A generic function to create a mock function, compatible with both runners. */
  fn: () => jest.Mock<unknown[], unknown>;
  /** A generic function to spy on a method, compatible with both runners. */
  spyOn: <T extends object, K extends keyof T>(object: T, method: K) => SmartSpy;
  /** Flag to track if fake timers are currently active */
  isFakeTimersActive: boolean;
}

declare global {
  var runner: Runner;
}
