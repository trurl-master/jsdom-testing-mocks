import { mockVisualViewport, mockVisualViewportForTestGroup } from './visual-viewport';

describe('mockVisualViewport', () => {
  const defaultDesc = {
    width: 375,
    height: 667,
    scale: 1,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
  };

  beforeEach(() => {
    // Clean up any existing visualViewport
    delete (window as { visualViewport?: VisualViewport }).visualViewport;
  });

  afterEach(() => {
    // Clean up any existing visualViewport
    delete (window as { visualViewport?: VisualViewport }).visualViewport;
  });

  it('should create a visualViewport with default values', () => {
    const visualViewport = mockVisualViewport(defaultDesc);

    expect(window.visualViewport).toBeDefined();
    expect(window.visualViewport?.width).toBe(375);
    expect(window.visualViewport?.height).toBe(667);
    expect(window.visualViewport?.scale).toBe(1);
    expect(window.visualViewport?.offsetLeft).toBe(0);
    expect(window.visualViewport?.offsetTop).toBe(0);
    expect(window.visualViewport?.pageLeft).toBe(0);
    expect(window.visualViewport?.pageTop).toBe(0);

    visualViewport.cleanup();
  });

  it('should update visualViewport properties when set is called', () => {
    const visualViewport = mockVisualViewport(defaultDesc);

    expect(window.visualViewport?.width).toBe(375);
    expect(window.visualViewport?.scale).toBe(1);

    visualViewport.set({
      width: 500,
      scale: 1.5,
    });

    expect(window.visualViewport?.width).toBe(500);
    expect(window.visualViewport?.scale).toBe(1.5);
    expect(window.visualViewport?.height).toBe(667); // unchanged

    visualViewport.cleanup();
  });

  it('should trigger resize event listeners', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeCallback = jest.fn();

    window.visualViewport?.addEventListener('resize', resizeCallback);

    expect(resizeCallback).not.toHaveBeenCalled();

    visualViewport.triggerResize();

    expect(resizeCallback).toHaveBeenCalledTimes(1);
    expect(resizeCallback).toHaveBeenCalledWith(expect.any(Event));

    visualViewport.cleanup();
  });

  it('should trigger scroll event listeners', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const scrollCallback = jest.fn();

    window.visualViewport?.addEventListener('scroll', scrollCallback);

    expect(scrollCallback).not.toHaveBeenCalled();

    visualViewport.triggerScroll();

    expect(scrollCallback).toHaveBeenCalledTimes(1);
    expect(scrollCallback).toHaveBeenCalledWith(expect.any(Event));

    visualViewport.cleanup();
  });

  it('should support onresize and onscroll handlers', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeHandler = jest.fn();
    const scrollHandler = jest.fn();

    if (window.visualViewport) {
      window.visualViewport.onresize = resizeHandler;
      window.visualViewport.onscroll = scrollHandler;
    }

    expect(resizeHandler).not.toHaveBeenCalled();
    expect(scrollHandler).not.toHaveBeenCalled();

    visualViewport.triggerResize();
    expect(resizeHandler).toHaveBeenCalledTimes(1);

    visualViewport.triggerScroll();
    expect(scrollHandler).toHaveBeenCalledTimes(1);

    visualViewport.cleanup();
  });

  it('should support event listener objects', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeHandler = {
      handleEvent: jest.fn(),
    };

    window.visualViewport?.addEventListener('resize', resizeHandler);

    expect(resizeHandler.handleEvent).not.toHaveBeenCalled();

    visualViewport.triggerResize();

    expect(resizeHandler.handleEvent).toHaveBeenCalledTimes(1);
    expect(resizeHandler.handleEvent).toHaveBeenCalledWith(expect.any(Event));

    visualViewport.cleanup();
  });

  it('should remove event listeners correctly', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeCallback = jest.fn();

    window.visualViewport?.addEventListener('resize', resizeCallback);

    visualViewport.triggerResize();
    expect(resizeCallback).toHaveBeenCalledTimes(1);

    window.visualViewport?.removeEventListener('resize', resizeCallback);

    visualViewport.triggerResize();
    expect(resizeCallback).toHaveBeenCalledTimes(1); // Should not be called again

    visualViewport.cleanup();
  });

  it('should support dispatchEvent', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeCallback = jest.fn();

    window.visualViewport?.addEventListener('resize', resizeCallback);

    const resizeEvent = new Event('resize');
    const result = window.visualViewport?.dispatchEvent(resizeEvent);

    expect(result).toBe(true);
    expect(resizeCallback).toHaveBeenCalledTimes(1);

    visualViewport.cleanup();
  });

  it('should cleanup correctly', () => {
    const visualViewport = mockVisualViewport(defaultDesc);

    expect(window.visualViewport).toBeDefined();

    visualViewport.cleanup();

    expect(window.visualViewport).toBeUndefined();
  });

  it('should have segments property that returns empty array', () => {
    const visualViewport = mockVisualViewport(defaultDesc);

    expect((window.visualViewport as VisualViewport & { segments: readonly DOMRectReadOnly[] })?.segments).toEqual([]);
    expect(Array.isArray((window.visualViewport as VisualViewport & { segments: readonly DOMRectReadOnly[] })?.segments)).toBe(true);

    visualViewport.cleanup();
  });

  it('should validate scale values', () => {
    const visualViewport = mockVisualViewport(defaultDesc);

    // Valid scale values should work
    expect(() => {
      visualViewport.set({ scale: 1.5 });
    }).not.toThrow();

    expect(() => {
      visualViewport.set({ scale: 0.5 });
    }).not.toThrow();

    // Invalid scale values should throw
    expect(() => {
      visualViewport.set({ scale: 0 });
    }).toThrow('Invalid scale value: 0. Scale must be a positive finite number.');

    expect(() => {
      visualViewport.set({ scale: -1 });
    }).toThrow('Invalid scale value: -1. Scale must be a positive finite number.');

    expect(() => {
      visualViewport.set({ scale: NaN });
    }).toThrow('Invalid scale value: NaN. Scale must be a positive finite number.');

    expect(() => {
      visualViewport.set({ scale: Infinity });
    }).toThrow('Invalid scale value: Infinity. Scale must be a positive finite number.');

    visualViewport.cleanup();
  });

  it('should accept options parameter in addEventListener and removeEventListener', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeCallback = jest.fn();

    // Should not throw when passing options
    expect(() => {
      window.visualViewport?.addEventListener('resize', resizeCallback, { capture: false });
    }).not.toThrow();

    // Should still work normally
    visualViewport.triggerResize();
    expect(resizeCallback).toHaveBeenCalledTimes(1);

    // Should not throw when removing with options
    expect(() => {
      window.visualViewport?.removeEventListener('resize', resizeCallback, { capture: false });
    }).not.toThrow();

    visualViewport.cleanup();
  });

  it('should not auto-dispatch events when set is called', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const resizeCallback = jest.fn();

    window.visualViewport?.addEventListener('resize', resizeCallback);

    // set() by itself should not trigger events
    visualViewport.set({ width: 500, height: 600 });
    expect(resizeCallback).not.toHaveBeenCalled();

    // triggerResize() should trigger events
    visualViewport.triggerResize();
    expect(resizeCallback).toHaveBeenCalledTimes(1);

    visualViewport.cleanup();
  });

  it('should support scrollend events', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const scrollendCallback = jest.fn();

    window.visualViewport?.addEventListener('scrollend', scrollendCallback);

    // triggerScrollend() should trigger events
    visualViewport.triggerScrollend();
    expect(scrollendCallback).toHaveBeenCalledTimes(1);

    visualViewport.cleanup();
  });

  it('should support onscrollend handler', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const scrollendHandler = jest.fn();

    // Type assertion to access the onscrollend property we added
    (window.visualViewport as VisualViewport & { onscrollend: ((this: VisualViewport, ev: Event) => void) | null }).onscrollend = scrollendHandler;

    // triggerScrollend() should call the handler
    visualViewport.triggerScrollend();
    expect(scrollendHandler).toHaveBeenCalledTimes(1);

    visualViewport.cleanup();
  });

  it('should support scrollend event listener objects', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const scrollendHandler = {
      handleEvent: jest.fn(),
    };

    window.visualViewport?.addEventListener('scrollend', scrollendHandler);

    // triggerScrollend() should call the handler
    visualViewport.triggerScrollend();
    expect(scrollendHandler.handleEvent).toHaveBeenCalledTimes(1);

    visualViewport.cleanup();
  });

  it('should remove scrollend event listeners correctly', () => {
    const visualViewport = mockVisualViewport(defaultDesc);
    const scrollendCallback = jest.fn();

    window.visualViewport?.addEventListener('scrollend', scrollendCallback);

    // triggerScrollend() should trigger events
    visualViewport.triggerScrollend();
    expect(scrollendCallback).toHaveBeenCalledTimes(1);

    // removeEventListener should remove the listener
    window.visualViewport?.removeEventListener('scrollend', scrollendCallback);

    // triggerScrollend() should not trigger events anymore
    visualViewport.triggerScrollend();
    expect(scrollendCallback).toHaveBeenCalledTimes(1); // Still 1, not 2

    visualViewport.cleanup();
  });
});

describe('mockVisualViewportForTestGroup', () => {
  it('should be a function', () => {
    expect(typeof mockVisualViewportForTestGroup).toBe('function');
  });
});

// Test the actual functionality at describe level
describe('mockVisualViewportForTestGroup - functional test', () => {
  mockVisualViewportForTestGroup({
    width: 400,
    height: 600,
    scale: 1.2,
    offsetLeft: 10,
    offsetTop: 20,
    pageLeft: 5,
    pageTop: 15,
  });

  it('should have visualViewport set up correctly', () => {
    expect(window.visualViewport).toBeDefined();
    expect(window.visualViewport?.width).toBe(400);
    expect(window.visualViewport?.height).toBe(600);
    expect(window.visualViewport?.scale).toBe(1.2);
    expect(window.visualViewport?.offsetLeft).toBe(10);
    expect(window.visualViewport?.offsetTop).toBe(20);
    expect(window.visualViewport?.pageLeft).toBe(5);
    expect(window.visualViewport?.pageTop).toBe(15);
  });
}); 