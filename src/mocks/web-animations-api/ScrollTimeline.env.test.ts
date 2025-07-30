import { mockScrollTimelines } from './index';

describe('ScrollTimeline Environment Tests', () => {
  beforeEach(() => {
    mockScrollTimelines();
  });

  afterEach(() => {
    // Clean up global modifications
    if ('ScrollTimeline' in window) {
      delete (window as any).ScrollTimeline;
    }
  });

  it('should integrate with existing Animation system', () => {
    const element = document.createElement('div');
    const scrollContainer = document.createElement('div');
    
    // Mock scroll properties
    Object.defineProperties(scrollContainer, {
      scrollTop: { value: 25, writable: true },
      scrollHeight: { value: 200, writable: true },
      clientHeight: { value: 100, writable: true }
    });

    const scrollTimeline = new ScrollTimeline({
      source: scrollContainer,
      axis: 'block'
    });

    expect(scrollTimeline.currentTime).toBe(25); // 25% scroll progress

    // Create animation with scroll timeline
    const keyframes = [
      { transform: 'translateX(0px)' },
      { transform: 'translateX(100px)' }
    ];

    const animation = new Animation(
      new KeyframeEffect(element, keyframes, { duration: 1000 }),
      scrollTimeline
    );

    expect(animation.timeline).toBe(scrollTimeline);
    expect(animation.timeline?.currentTime).toBe(25);
  });

  it('should work in different test environments', () => {
    expect(() => {
      const timeline = new ScrollTimeline();
      timeline.currentTime; // Should not throw
    }).not.toThrow();
  });

  it('should handle edge cases gracefully', () => {
    // Test with null source
    const timelineWithNull = new ScrollTimeline({ source: null });
    expect(timelineWithNull.currentTime).toBe(null);

    // Test with element that has no scroll capability
    const nonScrollElement = document.createElement('span');
    Object.defineProperties(nonScrollElement, {
      scrollTop: { value: 0, writable: true },
      scrollHeight: { value: 20, writable: true },
      clientHeight: { value: 20, writable: true }
    });

    const timeline = new ScrollTimeline({ source: nonScrollElement });
    expect(timeline.currentTime).toBe(0);
  });
});