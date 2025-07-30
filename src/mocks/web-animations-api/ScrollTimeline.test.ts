import { MockedScrollTimeline, mockScrollTimeline } from './ScrollTimeline';

describe('ScrollTimeline', () => {
  beforeEach(() => {
    mockScrollTimeline();
  });

  afterEach(() => {
    // Clean up any global modifications
    if ('ScrollTimeline' in window) {
      delete (window as any).ScrollTimeline;
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
    
    expect(timeline.currentTime).toBe(0);
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
    expect(timeline.currentTime).toBe(50);
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
    expect(timeline.currentTime).toBe(50);
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
    
    expect(timeline.currentTime).toBe(0);
  });
});