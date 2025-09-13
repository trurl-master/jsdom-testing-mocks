import { mockElementScrollProperties } from './scroll';

describe('mockElementScrollProperties', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('should mock scroll position properties', () => {
    mockElementScrollProperties(element, {
      scrollTop: 150,
      scrollLeft: 75
    });

    expect(element.scrollTop).toBe(150);
    expect(element.scrollLeft).toBe(75);
  });

  it('should mock scroll dimension properties', () => {
    mockElementScrollProperties(element, {
      scrollHeight: 1000,
      scrollWidth: 800
    });

    expect(element.scrollHeight).toBe(1000);
    expect(element.scrollWidth).toBe(800);
  });


  it('should mock all scroll properties at once', () => {
    mockElementScrollProperties(element, {
      scrollTop: 100,
      scrollLeft: 50,
      scrollHeight: 1000,
      scrollWidth: 800
    });

    expect(element.scrollTop).toBe(100);
    expect(element.scrollLeft).toBe(50);
    expect(element.scrollHeight).toBe(1000);
    expect(element.scrollWidth).toBe(800);
  });

  it('should allow properties to be modified after mocking', () => {
    mockElementScrollProperties(element, {
      scrollTop: 0,
      scrollHeight: 1000
    });

    // Properties should be writable
    element.scrollTop = 250;
    expect(element.scrollTop).toBe(250);
  });

  it('should restore original properties when restore function is called', () => {
    // Set initial scrollTop value (scrollHeight is read-only by default)
    Object.defineProperty(element, 'scrollTop', {
      value: 999,
      writable: true,
      configurable: true
    });

    const restore = mockElementScrollProperties(element, {
      scrollTop: 100,
      scrollHeight: 1000
    });

    expect(element.scrollTop).toBe(100);
    expect(element.scrollHeight).toBe(1000);

    // Restore original values
    restore();

    expect(element.scrollTop).toBe(999);
    // scrollHeight should be removed since it wasn't originally set
    expect(element.scrollHeight).toBe(0); // Default HTML element scroll height
  });

  it('should handle partial property mocking', () => {
    mockElementScrollProperties(element, {
      scrollTop: 100,
      scrollHeight: 1000
      // Intentionally omitting scrollLeft and scrollWidth
    });

    expect(element.scrollTop).toBe(100);
    expect(element.scrollHeight).toBe(1000);
    // Other scroll properties should retain their default values
    expect(element.scrollLeft).toBe(0);
    expect(element.scrollWidth).toBe(0);
  });

  it('should support common ScrollTimeline testing scenarios', () => {
    // Scenario 1: Element at start of scroll
    mockElementScrollProperties(element, {
      scrollTop: 0,
      scrollHeight: 1000
    });

    // You would need to mock clientHeight separately for real usage
    // Here we just test the scroll properties
    expect(element.scrollTop).toBe(0);
    expect(element.scrollHeight).toBe(1000);

    // Scenario 2: Element at middle of scroll
    mockElementScrollProperties(element, {
      scrollTop: 400,
      scrollHeight: 1000
    });

    expect(element.scrollTop).toBe(400);
    expect(element.scrollHeight).toBe(1000);

    // Scenario 3: Element at end of scroll
    mockElementScrollProperties(element, {
      scrollTop: 800,
      scrollHeight: 1000
    });

    expect(element.scrollTop).toBe(800);
    expect(element.scrollHeight).toBe(1000);
  });

  it('should handle edge case where content fits without scrolling', () => {
    mockElementScrollProperties(element, {
      scrollTop: 0,
      scrollHeight: 200
    });

    // When scrollHeight equals clientHeight, no scrolling is possible
    // (you'd need to mock clientHeight separately to test this)
    expect(element.scrollTop).toBe(0);
    expect(element.scrollHeight).toBe(200);
  });

  it('should support horizontal scrolling scenarios', () => {
    mockElementScrollProperties(element, {
      scrollLeft: 150,
      scrollWidth: 800
    });

    expect(element.scrollLeft).toBe(150);
    expect(element.scrollWidth).toBe(800);
    // You'd need to mock clientWidth separately for progress calculation
  });
});