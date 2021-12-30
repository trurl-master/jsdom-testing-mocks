type BoundingClientRect = {
  x?: number;
  y?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width?: number;
  height?: number;
};

export const mockElementBoundingClientRect = (
  element: HTMLElement,
  {
    x = 0,
    y = 0,
    top = 0,
    right = 0,
    bottom = 0,
    left = 0,
    width = 0,
    height = 0,
  }: BoundingClientRect
) => {
  const savedImplementation = element.getBoundingClientRect;

  const boundingClientRect = {
    x,
    y,
    top,
    right,
    bottom,
    left,
    width,
    height,
  };

  element.getBoundingClientRect = jest.fn(() => ({
    ...boundingClientRect,
    toJSON: () => JSON.stringify(boundingClientRect),
  }));

  afterEach(() => {
    element.getBoundingClientRect = savedImplementation;
  });
};
