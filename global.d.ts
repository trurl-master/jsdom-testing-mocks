/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mock as ViMock } from 'vitest';

// By re-declaring the vitest module, we can augment its types.
declare module 'vitest' {
  /**
   * Augment vitest's Mock type to be compatible with jest.Mock.
   * This allows us to use a single, consistent type for mocks across both test runners.
   */
  export interface Mock<A extends unknown[] = unknown[], R = unknown>
    extends jest.Mock<A, R> {}

  /**
   * Augment vitest's SpyInstance to be compatible with jest.SpyInstance.
   * Note the swapped generic arguments:
   * - Vitest: SpyInstance<[Args], ReturnValue>
   * - Jest: SpyInstance<ReturnValue, [Args]>
   * This declaration makes them interoperable.
   */
  export interface SpyInstance<A extends unknown[] = unknown[], R = unknown>
    extends jest.SpyInstance<R, A> {}
}

export {};

interface Runner {
  name: 'vi' | 'jest';
  useFakeTimers: () => void;
  useRealTimers: () => void;
  advanceTimersByTime: (time: number) => Promise<void> | void;
  /** A generic function to create a mock function, compatible with both runners. */
  fn: () => jest.Mock<unknown[], unknown>;
  /** A generic function to spy on a method, compatible with both runners. */
  spyOn: typeof jest.spyOn;
}

declare global {
  // eslint-disable-next-line no-var
  var runner: Runner;
}
