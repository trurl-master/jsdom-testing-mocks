import { isJsdomEnv, WrongEnvironmentError } from '../../helper';

const protectedProps = ['_x', '_y', '_width', '_height'];

class MockedDOMRectReadOnly implements DOMRectReadOnly {
  _x: number;
  _y: number;
  _width: number;
  _height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;

    // make protected props non-enumerable
    protectedProps.forEach((prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(this, prop);

      if (descriptor) {
        Object.defineProperty(this, prop, {
          ...descriptor,
          enumerable: false,
        });
      }
    });
  }

  get x() {
    return this._x;
  }

  set x(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get y() {
    return this._y;
  }

  set y(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get width() {
    return this._width;
  }

  set width(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get height() {
    return this._height;
  }

  set height(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get left() {
    return this._x;
  }

  set left(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get right() {
    return this._x + Math.max(0, this._width);
  }

  set right(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get top() {
    return this._y;
  }

  set top(_value: number) {
    /* read-only – ignore writes to mimic native */
  }

  get bottom() {
    return this._y + Math.max(0, this._height);
  }

  set bottom(_value: number) {
    /* read-only – ignore writes to mimic native */
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

  toString() {
    return '[object DOMRectReadOnly]';
  }
}

class MockedDOMRect extends MockedDOMRectReadOnly implements DOMRect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);
  }

  get x() {
    return super.x;
  }

  set x(_value: number) {
    this._x = _value;
  }

  get y() {
    return super.y;
  }

  set y(_value: number) {
    this._y = _value;
  }

  get width() {
    return super.width;
  }

  set width(_value: number) {
    this._width = _value;
  }

  get height() {
    return super.height;
  }

  set height(_value: number) {
    this._height = _value;
  }

  toString() {
    return '[object DOMRect]';
  }
}

function mockDOMRect() {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  // Always override to ensure consistent behaviour across environments
  Object.defineProperty(window, 'DOMRectReadOnly', {
    writable: true,
    configurable: true,
    value: MockedDOMRectReadOnly,
  });

  Object.defineProperty(window, 'DOMRect', {
    writable: true,
    configurable: true,
    value: MockedDOMRect,
  });
}

export { MockedDOMRectReadOnly, MockedDOMRect, mockDOMRect };
