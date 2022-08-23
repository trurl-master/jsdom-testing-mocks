import './DOMRect';

export const mockElementBoundingClientRect = (
  element: HTMLElement,
  {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
  }: Partial<Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>>
) => {
  const savedImplementation = element.getBoundingClientRect;

  element.getBoundingClientRect = jest.fn(
    () => new DOMRectReadOnly(x, y, width, height)
  );

  return savedImplementation;
};
