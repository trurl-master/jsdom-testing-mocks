import { render } from '@testing-library/react';
import { mockAnimationsApi, mockElementScrollProperties, mockElementClientProperties } from '../../../../../../dist';
import { ScrollTimelineExample } from './ScrollTimeline';

// Mock the ScrollTimeline API before tests
mockAnimationsApi();

describe('ScrollTimeline Mock Functionality', () => {
  it('should create ScrollTimeline and Animation instances', () => {
    render(<ScrollTimelineExample />);
    
    // Verify that ScrollTimeline constructor is available
    expect(window.ScrollTimeline).toBeDefined();
    expect(window.Animation).toBeDefined();
    expect(window.KeyframeEffect).toBeDefined();
    
    // Verify that CSS.scroll function is available
    expect(CSS).toBeDefined();
    expect(CSS.scroll).toBeDefined();
    expect(typeof CSS.scroll).toBe('function');
  });

  it('should create a ScrollTimeline instance with proper configuration', () => {
    // Test the mock directly using the new separated utilities
    const element = document.createElement('div');
    mockElementScrollProperties(element, {
      scrollTop: 0,
      scrollHeight: 1000
    });
    mockElementClientProperties(element, {
      clientHeight: 100
    });

    const timeline = new window.ScrollTimeline({
      source: element,
      axis: 'block'
    });

    expect(timeline).toBeDefined();
    expect(timeline.source).toBe(element);
    expect(timeline.axis).toBe('block');
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should calculate currentTime based on scroll progress', () => {
    const element = document.createElement('div');
    mockElementScrollProperties(element, {
      scrollTop: 450,
      scrollHeight: 1000
    });
    mockElementClientProperties(element, {
      clientHeight: 100
    });

    const timeline = new window.ScrollTimeline({
      source: element,
      axis: 'block'
    });

    // currentTime should be (450 / (1000 - 100)) * 100 = 50
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(50);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should update Animation progress based on ScrollTimeline', async () => {
    const scrollContainer = document.createElement('div');
    const targetElement = document.createElement('div');
    
    mockElementScrollProperties(scrollContainer, {
      scrollTop: 0,
      scrollHeight: 1000
    });
    mockElementClientProperties(scrollContainer, {
      clientHeight: 100
    });

    // Use the modern CSS.scroll() approach - exactly what we wanted!
    const animation = targetElement.animate(
      [
        { transform: 'translateX(0px)', backgroundColor: 'red' },
        { transform: 'translateX(100px)', backgroundColor: 'blue' }
      ],
      {
        duration: "auto", // Proper duration for scroll-driven animations
        timeline: CSS.scroll({ 
          source: scrollContainer,
          axis: 'block' 
        })
      }
    );

    // Wait for animation to be ready
    await animation.ready;
    
    // At start of scroll (0%), first keyframe should be applied  
    const currentTime = animation.timeline?.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
    expect(targetElement.style.transform).toBe('translateX(0px)');
    expect(targetElement.style.backgroundColor).toBe('red');

    // Simulate scroll to 50% progress
    scrollContainer.scrollTop = 450; // (450 / (1000 - 100)) * 100 = 50%
    
    // Trigger scroll event to update animations
    scrollContainer.dispatchEvent(new Event('scroll'));
    
    // Verify timeline reflects new scroll position
    const newCurrentTime = animation.timeline?.currentTime;
    expect(newCurrentTime).toBeInstanceOf(CSSUnitValue);
    if (newCurrentTime instanceof CSSUnitValue) {
      expect(newCurrentTime.value).toBe(50);
      expect(newCurrentTime.unit).toBe('percent');
    }
    
    // At 50% scroll progress, should apply the closest keyframe (second one)
    expect(targetElement.style.transform).toBe('translateX(100px)');
    expect(targetElement.style.backgroundColor).toBe('blue');
  });

  it('should handle edge cases correctly', () => {
    const element = document.createElement('div');
    
    // Test non-scrollable element
    mockElementScrollProperties(element, {
      scrollTop: 0,
      scrollHeight: 100
    });
    mockElementClientProperties(element, {
      clientHeight: 100
    });

    const timeline = new window.ScrollTimeline({
      source: element,
      axis: 'block'
    });

    let currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }

    // Test max scroll
    mockElementScrollProperties(element, {
      scrollTop: 900,
      scrollHeight: 1000
    });
    mockElementClientProperties(element, {
      clientHeight: 100
    });
    
    currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(100);
      expect(currentTime.unit).toBe('percent');
    }
  });
});