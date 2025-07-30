import { mockScrollTimelines } from './index';

describe('ScrollTimeline Browser Tests', () => {
  beforeEach(() => {
    mockScrollTimelines();
  });

  afterEach(() => {
    // Clean up global modifications
    if ('ScrollTimeline' in window) {
      delete (window as any).ScrollTimeline;
    }
  });

  it('should work with real DOM elements in browser', () => {
    // Create a real scrollable container
    const container = document.createElement('div');
    container.style.cssText = `
      width: 200px;
      height: 200px;
      overflow: auto;
      border: 1px solid #ccc;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      width: 100%;
      height: 800px;
      background: linear-gradient(to bottom, red, blue);
    `;

    container.appendChild(content);
    document.body.appendChild(container);

    try {
      const scrollTimeline = new ScrollTimeline({
        source: container,
        axis: 'block'
      });

      // Initially at top
      expect(scrollTimeline.currentTime).toBe(0);

      // Simulate scroll
      container.scrollTop = 150; // 150 out of 600 possible scroll
      
      // Should calculate progress: 150 / (800 - 200) = 0.25 = 25%
      expect(scrollTimeline.currentTime).toBe(25);

      // Test animation integration
      const element = document.createElement('div');
      element.style.cssText = `
        width: 50px;
        height: 50px;
        background: red;
        position: absolute;
        top: 10px;
        left: 10px;
      `;
      document.body.appendChild(element);

      const animation = new Animation(
        new KeyframeEffect(element, [
          { transform: 'translateX(0px)' },
          { transform: 'translateX(100px)' }
        ], { duration: 1000 }),
        scrollTimeline
      );

      animation.play();
      
      expect(animation.timeline).toBe(scrollTimeline);
      expect(animation.playState).toBe('running');

      document.body.removeChild(element);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should handle horizontal scrolling', () => {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 200px;
      height: 100px;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      width: 800px;
      height: 100px;
      background: linear-gradient(to right, red, blue);
      display: inline-block;
    `;

    container.appendChild(content);
    document.body.appendChild(container);

    try {
      const scrollTimeline = new ScrollTimeline({
        source: container,
        axis: 'x'
      });

      // Initially at left
      expect(scrollTimeline.currentTime).toBe(0);

      // Simulate horizontal scroll
      container.scrollLeft = 150; // 150 out of 600 possible scroll
      
      // Should calculate progress: 150 / (800 - 200) = 0.25 = 25%
      expect(scrollTimeline.currentTime).toBe(25);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should work with document scrolling', () => {
    // Mock document scrolling properties for test
    const originalScrollTop = document.documentElement.scrollTop;
    const originalScrollHeight = document.documentElement.scrollHeight;
    const originalClientHeight = document.documentElement.clientHeight;

    Object.defineProperties(document.documentElement, {
      scrollTop: { value: 100, configurable: true, writable: true },
      scrollHeight: { value: 2000, configurable: true, writable: true },
      clientHeight: { value: 800, configurable: true, writable: true }
    });

    try {
      const scrollTimeline = new ScrollTimeline(); // Uses document by default

      // Should calculate: 100 / (2000 - 800) = 100 / 1200 ≈ 8.33%
      expect(scrollTimeline.currentTime).toBeCloseTo(8.33, 1);
    } finally {
      // Restore original values
      Object.defineProperties(document.documentElement, {
        scrollTop: { value: originalScrollTop, configurable: true, writable: true },
        scrollHeight: { value: originalScrollHeight, configurable: true, writable: true },
        clientHeight: { value: originalClientHeight, configurable: true, writable: true }
      });
    }
  });
});