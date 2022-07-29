export const wait = (time: number) => new Promise((r) => setTimeout(r, time));
export const expectTime = (
  time: number | null | undefined,
  expected: number
) => {
  expect((time ?? 0) / 1000).toBeCloseTo(expected / 1000, 1);
};

// export function flushPromises(): Promise<void> {
//   return new Promise(jest.requireActual('timers').setImmediate);
// }

const tick = () =>
  new Promise((res) => jest.requireActual('timers').setImmediate(res));

export const advanceTimersByTime = async (time: number) =>
  jest.advanceTimersByTime(time) && (await tick());
