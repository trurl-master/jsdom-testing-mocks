import { MockedScrollTimeline, mockScrollTimeline } from './ScrollTimeline';

describe('ScrollTimeline', () => {
  beforeEach(() => {
    mockScrollTimeline();
  });

  afterEach(() => {
    // Clean up any global modifications
    if ('ScrollTimeline' in window) {
      Reflect.deleteProperty(window, 'ScrollTimeline');
    }
  });

  it('should be available globally after mocking', () => {
    expect(window.ScrollTimeline).toBeDefined();
    expect(window.ScrollTimeline).toBe(MockedScrollTimeline);
  });

  it('should create a ScrollTimeline with default options', () => {
    const timeline = new ScrollTimeline();
    
    expect(timeline).toBeInstanceOf(MockedScrollTimeline);
    expect(timeline.axis).toBe('block');
    expect(timeline.source).toBeTruthy(); // Should default to scrolling element
  });

  it('should throw error for invalid axis parameter', () => {
    expect(() => {
      new ScrollTimeline({
        axis: 'invalid' as 'block' | 'inline' | 'x' | 'y'
      });
    }).toThrow('Invalid axis value: invalid');
  });

  it('should throw error when no scroll source is available', () => {
    // Mock scenario where document has no scrolling element
    const originalScrollingElement = document.scrollingElement;
    const originalDocumentElement = document.documentElement;
    
    Object.defineProperty(document, 'scrollingElement', {
      value: null,
      configurable: true
    });
    Object.defineProperty(document, 'documentElement', {
      value: null,
      configurable: true
    });

    try {
      expect(() => {
        new ScrollTimeline();
      }).toThrow('No scroll source available');
    } finally {
      // Restore original values
      Object.defineProperty(document, 'scrollingElement', {
        value: originalScrollingElement,
        configurable: true
      });
      Object.defineProperty(document, 'documentElement', {
        value: originalDocumentElement,
        configurable: true
      });
    }
  });

  it('should create a ScrollTimeline with custom options', () => {
    const mockElement = document.createElement('div');
    const timeline = new ScrollTimeline({
      source: mockElement,
      axis: 'inline'
    });
    
    expect(timeline.source).toBe(mockElement);
    expect(timeline.axis).toBe('inline');
  });

  it('should return null currentTime when source has no scroll', () => {
    const mockElement = document.createElement('div');
    Object.defineProperties(mockElement, {
      scrollTop: { value: 0, writable: true },
      scrollLeft: { value: 0, writable: true },
      scrollHeight: { value: 100, writable: true },
      scrollWidth: { value: 100, writable: true },
      clientHeight: { value: 100, writable: true },
      clientWidth: { value: 100, writable: true }
    });

    const timeline = new ScrollTimeline({
      source: mockElement,
      axis: 'block'
    });
    
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should calculate currentTime based on scroll position', () => {
    const mockElement = document.createElement('div');
    Object.defineProperties(mockElement, {
      scrollTop: { value: 50, writable: true },
      scrollLeft: { value: 0, writable: true },
      scrollHeight: { value: 200, writable: true },
      scrollWidth: { value: 100, writable: true },
      clientHeight: { value: 100, writable: true },
      clientWidth: { value: 100, writable: true }
    });

    const timeline = new ScrollTimeline({
      source: mockElement,
      axis: 'block'
    });
    
    // 50 / (200 - 100) = 0.5, so 50% progress
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(50);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should handle horizontal scrolling with x axis', () => {
    const mockElement = document.createElement('div');
    Object.defineProperties(mockElement, {
      scrollTop: { value: 0, writable: true },
      scrollLeft: { value: 25, writable: true },
      scrollHeight: { value: 100, writable: true },
      scrollWidth: { value: 150, writable: true },
      clientHeight: { value: 100, writable: true },
      clientWidth: { value: 100, writable: true }
    });

    const timeline = new ScrollTimeline({
      source: mockElement,
      axis: 'x'
    });
    
    // 25 / (150 - 100) = 0.5, so 50% progress
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(50);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should return 0 when element is not scrollable', () => {
    const mockElement = document.createElement('div');
    Object.defineProperties(mockElement, {
      scrollTop: { value: 0, writable: true },
      scrollLeft: { value: 0, writable: true },
      scrollHeight: { value: 100, writable: true },
      scrollWidth: { value: 100, writable: true },
      clientHeight: { value: 100, writable: true },
      clientWidth: { value: 100, writable: true }
    });

    const timeline = new ScrollTimeline({
      source: mockElement
    });
    
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
  });
});