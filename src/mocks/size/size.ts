import { mockDOMRect } from './DOMRect';

export const mockElementBoundingClientRect = (
  element: HTMLElement,
  {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
  }: Partial<Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>>
) => {
  mockDOMRect();

  const savedImplementation = element.getBoundingClientRect;

  element.getBoundingClientRect = () =>
    new DOMRectReadOnly(x, y, width, height);

  return savedImplementation;
};
