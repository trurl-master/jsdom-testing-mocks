/**
 * Jest-specific setup for unified testing framework abstraction.
 *
 * This file provides Jest implementations of the unified testing utilities
 * available on the global `runner` object. It creates a consistent interface
 * that allows the library's tests to work identically across Jest, Vitest,
 * and SWC test environments.
 *
 * The key pattern here is the SmartSpy system, which wraps framework-specific
 * spy objects (like Jest's SpyInstance) to provide a unified API.
 */

/**
 * Unified spy interface that works consistently across Jest and Vitest.
 *
 * This interface defines the common spy methods that our library needs,
 * providing a consistent API regardless of the underlying testing framework.
 * The implementation only includes the methods we actually use in our tests.
 */
interface SmartSpy {
  /** Mock the implementation of the spied method */
  mockImplementation: (fn: () => void) => SmartSpy;
  /** Assert that the spy was called with specific arguments */
  toHaveBeenCalledWith: (...args: unknown[]) => void;
  /** Restore the original method implementation */
  mockRestore: () => void;
  /** Allow access to any other spy properties/methods from the underlying framework */
  [key: string]: unknown;
}

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

/**
 * Creates a unified spy interface that works consistently across Jest and Vitest.
 *
 * This function wraps a Jest SpyInstance in a Proxy to provide a consistent API
 * that matches the SmartSpy interface expected by the testing framework abstraction.
 *
 * The proxy intercepts calls to specific methods (mockImplementation, toHaveBeenCalledWith,
 * mockRestore) and ensures they work the same way regardless of whether the underlying
 * spy is from Jest or Vitest. For all other properties/methods, it passes through
 * to the original spy.
 *
 * This is part of the broader pattern in this library where we create unified interfaces
 * across different testing frameworks (Jest, Vitest, SWC) so that the library's mocks
 * work consistently in any environment.
 *
 * @param realSpy - The underlying Jest SpyInstance to wrap
 * @returns A proxy that implements the SmartSpy interface
 */
function createSmartSpy(realSpy: jest.SpyInstance): SmartSpy {
  return new Proxy(realSpy as object, {
    get(target, prop) {
      // Switch on the specific methods we need to implement
      switch (prop) {
        case 'mockImplementation':
          return (fn: () => void) => {
            (target as jest.SpyInstance).mockImplementation(fn);
            return createSmartSpy(target as jest.SpyInstance);
          };

        case 'toHaveBeenCalledWith':
          return (...args: unknown[]) => {
            // Jest SpyInstance doesn't have toHaveBeenCalledWith as a method,
            // but Vitest spies do. For compatibility, we implement it by checking
            // the spy's call history manually to match Vitest's behavior.
            const jestSpy = target as jest.SpyInstance;

            // Check if any call matches the expected arguments
            const calls = jestSpy.mock.calls;
            const hasMatchingCall = calls.some((call: unknown[]) => {
              if (call.length !== args.length) return false;
              return call.every((arg: unknown, index: number) => {
                // Use Jest's deep equality matching
                try {
                  expect(arg).toEqual(args[index]);
                  return true;
                } catch {
                  return false;
                }
              });
            });

            if (!hasMatchingCall) {
              throw new Error(
                `Expected spy to have been called with [${args.map((arg: unknown) => JSON.stringify(arg)).join(', ')}], ` +
                  `but it was called with: ${calls
                    .map(
                      (call: unknown[]) =>
                        `[${call.map((arg: unknown) => JSON.stringify(arg)).join(', ')}]`
                    )
                    .join(', ')}`
              );
            }
          };

        case 'mockRestore':
          return () => {
            (target as jest.SpyInstance).mockRestore();
          };

        default:
          // For everything else, just pass through to the real spy
          return (target as Record<string | symbol, unknown>)[prop];
      }
    },
  }) as SmartSpy;
}

/**
 * Creates a spy on an object method using Jest's spyOn, wrapped with SmartSpy interface.
 *
 * This is the Jest-specific implementation of the unified spyOn function that's available
 * on the global `runner` object. It creates a Jest spy and wraps it with createSmartSpy
 * to provide a consistent interface across testing frameworks.
 *
 * @param object - The object to spy on
 * @param method - The method name to spy on
 * @returns A SmartSpy that provides unified spy functionality
 */
function spyOn<T extends object, K extends keyof T>(
  object: T,
  method: K
): SmartSpy {
  // Use a more specific type assertion to avoid 'any'
  const spyFunction = jest.spyOn as (object: T, method: K) => jest.SpyInstance;
  const realSpy = spyFunction(object, method);
  return createSmartSpy(realSpy);
}

globalThis.runner = {
  name: 'jest',
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  fn,
  spyOn,
};
