import { mockElementClientProperties } from './client';

describe('mockElementClientProperties', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('should mock client height property', () => {
    mockElementClientProperties(element, {
      clientHeight: 200
    });

    expect(element.clientHeight).toBe(200);
  });

  it('should mock client width property', () => {
    mockElementClientProperties(element, {
      clientWidth: 300
    });

    expect(element.clientWidth).toBe(300);
  });

  it('should mock both client dimensions at once', () => {
    mockElementClientProperties(element, {
      clientHeight: 200,
      clientWidth: 300
    });

    expect(element.clientHeight).toBe(200);
    expect(element.clientWidth).toBe(300);
  });

  it('should allow properties to be modified after mocking', () => {
    mockElementClientProperties(element, {
      clientHeight: 200
    });

    // Properties should be writable - we need to assign directly since our mock makes it writable
    Object.assign(element, { clientHeight: 250 });
    expect(element.clientHeight).toBe(250);
  });

  it('should restore original properties when restore function is called', () => {
    // Set initial clientHeight value
    Object.defineProperty(element, 'clientHeight', {
      value: 999,
      writable: true,
      configurable: true
    });

    const restore = mockElementClientProperties(element, {
      clientHeight: 200,
      clientWidth: 300
    });

    expect(element.clientHeight).toBe(200);
    expect(element.clientWidth).toBe(300);

    // Restore original values
    restore();

    expect(element.clientHeight).toBe(999);
    // clientWidth should be removed since it wasn't originally set
    expect(element.clientWidth).toBe(0); // Default HTML element client width
  });

  it('should handle partial property mocking', () => {
    mockElementClientProperties(element, {
      clientHeight: 200
      // Intentionally omitting clientWidth
    });

    expect(element.clientHeight).toBe(200);
    // Other client property should retain its default value
    expect(element.clientWidth).toBe(0);
  });

  it('should work well with scroll properties for complete testing', () => {
    // This test shows how you'd combine scroll and client mocking
    mockElementClientProperties(element, {
      clientHeight: 200,
      clientWidth: 300
    });

    // Simulate setting scroll properties (would normally use mockElementScrollProperties)
    Object.defineProperties(element, {
      scrollTop: { value: 100, writable: true, configurable: true },
      scrollHeight: { value: 1000, writable: true, configurable: true },
      scrollLeft: { value: 50, writable: true, configurable: true },
      scrollWidth: { value: 800, writable: true, configurable: true }
    });

    // Test scroll progress calculations
    const verticalProgress = element.scrollTop / (element.scrollHeight - element.clientHeight);
    expect(verticalProgress).toBe(0.125); // 100 / (1000 - 200) = 0.125 (12.5%)

    const horizontalProgress = element.scrollLeft / (element.scrollWidth - element.clientWidth);
    expect(horizontalProgress).toBe(0.1); // 50 / (800 - 300) = 0.1 (10%)
  });
});