export const wait = (time: number) => new Promise((r) => setTimeout(r, time));
export const expectTime = (
  time: number | null | undefined,
  expected: number
) => {
  expect((time ?? 0) / 1000).toBeCloseTo(expected / 1000, 1);
};
