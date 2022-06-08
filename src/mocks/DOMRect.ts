export class MockedDOMRectReadOnly implements DOMRectReadOnly {
  readonly bottom: number = 0;
  readonly height: number = 0;
  readonly left: number = 0;
  readonly right: number = 0;
  readonly top: number = 0;
  readonly width: number = 0;
  readonly x: number = 0;
  readonly y: number = 0;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  toJSON() {
    return {
      bottom: this.bottom,
      height: this.height,
      left: this.left,
      right: this.right,
      top: this.top,
      width: this.width,
      x: this.x,
      y: this.y,
    };
  }
}

if (typeof DOMRectReadOnly === 'undefined') {
  Object.defineProperty(window, 'DOMRectReadOnly', {
    writable: true,
    configurable: true,
    value: MockedDOMRectReadOnly,
  });
}
