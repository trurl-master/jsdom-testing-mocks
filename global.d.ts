export {};

declare global {
  // eslint-disable-next-line no-var
  var runner: {
    name: 'vi' | 'jest';
    useFakeTimers: () => void;
    useRealTimers: () => void;
    advanceTimersByTime: (time: number) => Promise<void>;
    fn: () => jest.Mock<any, any>;
  };
}
