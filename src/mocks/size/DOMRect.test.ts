/* eslint-disable @typescript-eslint/ban-ts-comment */
import './DOMRect';

describe('DOMRectReadOnly', () => {
  test('constructor and props', () => {
    const domRect = new DOMRectReadOnly(100, 100, 200, 200);

    expect(domRect.x).toBe(100);
    expect(domRect.y).toBe(100);
    expect(domRect.width).toBe(200);
    expect(domRect.height).toBe(200);
    expect(domRect.top).toBe(100);
    expect(domRect.right).toBe(300);
    expect(domRect.bottom).toBe(300);
    expect(domRect.left).toBe(100);
  });

  test('there should be no enumerable props', () => {
    const domRect = new DOMRectReadOnly(100, 100, 200, 200);

    expect(Object.keys(domRect)).toEqual([]);
  });

  it('should be impossible to set x, y, width, height', () => {
    const domRect = new DOMRectReadOnly(100, 100, 200, 200);

    // @ts-ignore
    domRect.x = 150;
    // @ts-ignore
    domRect.y = 250;
    // @ts-ignore
    domRect.width = 350;
    // @ts-ignore
    domRect.height = 450;

    expect(domRect.x).toBe(100);
    expect(domRect.y).toBe(100);
    expect(domRect.width).toBe(200);
    expect(domRect.height).toBe(200);
  });

  it('should be impossible to set top, right, bottom, left', () => {
    const domRect = new DOMRectReadOnly(100, 100, 200, 200);

    // @ts-ignore
    domRect.top = 150;
    // @ts-ignore
    domRect.right = 250;
    // @ts-ignore
    domRect.bottom = 350;
    // @ts-ignore
    domRect.left = 450;

    expect(domRect.top).toBe(100);
    expect(domRect.right).toBe(300);
    expect(domRect.bottom).toBe(300);
    expect(domRect.left).toBe(100);
  });

  test('toJSON', () => {
    const domRect = new DOMRectReadOnly(100, 100, 200, 200);

    expect(domRect.toJSON()).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      top: 100,
      right: 300,
      bottom: 300,
      left: 100,
    });
  });

  test('toString', () => {
    const domRect = new DOMRectReadOnly(100, 100, 200, 200);

    expect(domRect.toString()).toBe('[object DOMRectReadOnly]');
  });
});

describe('DOMRect', () => {
  test('constructor and props', () => {
    const domRect = new DOMRect(100, 100, 200, 200);

    expect(domRect.x).toBe(100);
    expect(domRect.y).toBe(100);
    expect(domRect.width).toBe(200);
    expect(domRect.height).toBe(200);
    expect(domRect.top).toBe(100);
    expect(domRect.right).toBe(300);
    expect(domRect.bottom).toBe(300);
    expect(domRect.left).toBe(100);
  });

  test('there should be no enumerable props', () => {
    const domRect = new DOMRect(100, 100, 200, 200);

    expect(Object.keys(domRect)).toEqual([]);
  });

  it('should be possible to set x, y, width, height', () => {
    const domRect = new DOMRect(100, 100, 200, 200);

    domRect.x = 200;
    domRect.y = 200;
    domRect.width = 300;
    domRect.height = 300;

    expect(domRect.x).toBe(200);
    expect(domRect.y).toBe(200);
    expect(domRect.width).toBe(300);
    expect(domRect.height).toBe(300);
    expect(domRect.top).toBe(200);
    expect(domRect.right).toBe(500);
    expect(domRect.bottom).toBe(500);
    expect(domRect.left).toBe(200);
  });

  it('should be impossible to set the top, right, bottom, left props', () => {
    const domRect = new DOMRect(100, 100, 200, 200);

    // @ts-ignore
    domRect.top = 150;
    // @ts-ignore
    domRect.right = 250;
    // @ts-ignore
    domRect.bottom = 350;
    // @ts-ignore
    domRect.left = 450;

    expect(domRect.top).toBe(100);
    expect(domRect.right).toBe(300);
    expect(domRect.bottom).toBe(300);
    expect(domRect.left).toBe(100);
  });

  test('toString', () => {
    const domRect = new DOMRect(100, 100, 200, 200);

    expect(domRect.toString()).toBe('[object DOMRect]');
  });
});
