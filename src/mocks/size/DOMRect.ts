export class MockedDOMRectReadOnly implements DOMRectReadOnly {
  readonly x: number = 0;
  readonly y: number = 0;
  readonly width: number = 0;
  readonly height: number = 0;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + Math.max(0, this.width);
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + Math.max(0, this.height);
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
