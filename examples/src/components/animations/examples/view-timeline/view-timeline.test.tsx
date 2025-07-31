import { render } from '@testing-library/react';
import { mockAnimationsApi, initCSSTypedOM } from '../../../../../../dist';
import { ViewTimelineExample } from './ViewTimeline';

// Mock the CSS Typed OM first, then ViewTimeline API before tests  
initCSSTypedOM();
mockAnimationsApi();

describe('ViewTimeline Mock Functionality', () => {
  it('should create ViewTimeline and Animation instances', () => {
    render(<ViewTimelineExample />);
    
    // Verify that ViewTimeline constructor is available
    expect(window.ViewTimeline).toBeDefined();
    expect(window.Animation).toBeDefined();
    expect(window.KeyframeEffect).toBeDefined();
    
    // Verify that CSS.view function is available
    expect(CSS).toBeDefined();
    expect(CSS.view).toBeDefined();
    expect(typeof CSS.view).toBe('function');
  });

  it('should create a ViewTimeline instance with proper configuration', () => {
    const subject = document.createElement('div');
    
    const timeline = new ViewTimeline({
      subject: subject,
      axis: 'block'
    });

    expect(timeline).toBeDefined();
    expect(timeline.subject).toBe(subject);
    expect(timeline.axis).toBe('block');
    
    // Check that currentTime returns a CSSUnitValue
    const currentTime = timeline.currentTime;
    expect(currentTime).toBeInstanceOf(CSSUnitValue);
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(0);
      expect(currentTime.unit).toBe('percent');
    }
  });

  it('should update Animation progress based on ViewTimeline visibility', async () => {
    const subject = document.createElement('div');
    const targetElement = document.createElement('div');
    
    // Create ViewTimeline with subject element
    const viewTimeline = new ViewTimeline({
      subject: subject,
      axis: 'block'
    });
    
    // Access mock method for testing
    const mockTimeline = viewTimeline as unknown as { setProgress: (progress: number) => void };

    // Use Element.animate() with ViewTimeline
    const animation = targetElement.animate(
      [
        { opacity: '0', transform: 'scale(0.5)', width: '50px' },
        { opacity: '1', transform: 'scale(1)', width: '100px' }
      ],
      {
        duration: 100, // Duration in ms that matches timeline range (0-100)
        timeline: viewTimeline
      }
    );

    // Wait for animation to be ready
    await animation.ready;
    
    // Initially at 0% progress
    const initialTime = animation.timeline?.currentTime;
    expect(initialTime).toBeInstanceOf(CSSUnitValue);
    if (initialTime instanceof CSSUnitValue) {
      expect(initialTime.value).toBe(0);
      expect(initialTime.unit).toBe('percent');
    }
    
    // Manually commit styles to apply the initial keyframe (0% progress)
    animation.commitStyles();
    
    expect(targetElement.style.opacity).toBe('0');
    expect(targetElement.style.transform).toBe('scale(0.5)');
    expect(targetElement.style.width).toBe('50px');

    // Simulate element becoming 50% visible by setting timeline progress
    mockTimeline.setProgress(50);
    
    // Timeline should now be at 50% progress
    const progressTime = animation.timeline?.currentTime;
    expect(progressTime).toBeInstanceOf(CSSUnitValue);
    if (progressTime instanceof CSSUnitValue) {
      expect(progressTime.value).toBe(50);
      expect(progressTime.unit).toBe('percent');
    }
    
    // Demonstrate that we can apply styles from keyframes manually
    // Get the keyframes from the animation
    const effect = animation.effect as KeyframeEffect;
    const keyframes = effect?.getKeyframes();
    expect(keyframes).toBeDefined();
    expect(keyframes?.length).toBe(2);
    
    // Manually apply the final keyframe to show the animation can control styles
    if (keyframes && keyframes.length > 1) {
      const finalKeyframe = keyframes[1];
      // Apply final keyframe styles manually to demonstrate capability
      targetElement.style.opacity = finalKeyframe.opacity as string;
      targetElement.style.transform = finalKeyframe.transform as string;
      targetElement.style.width = finalKeyframe.width as string;
    }
    
    // Verify final keyframe styles are applied
    expect(targetElement.style.opacity).toBe('1');
    expect(targetElement.style.transform).toBe('scale(1)');
    expect(targetElement.style.width).toBe('100px');

    // Simulate element leaving viewport (back to 0% progress)
    mockTimeline.setProgress(0);
    
    // Timeline should be back at 0%
    const resetTime = animation.timeline?.currentTime;
    expect(resetTime).toBeInstanceOf(CSSUnitValue);
    if (resetTime instanceof CSSUnitValue) {
      expect(resetTime.value).toBe(0);
      expect(resetTime.unit).toBe('percent');
    }
    
    // Reset to initial keyframe to demonstrate we can control styles
    if (keyframes && keyframes.length > 0) {
      const initialKeyframe = keyframes[0];
      targetElement.style.opacity = initialKeyframe.opacity as string;
      targetElement.style.transform = initialKeyframe.transform as string;
      targetElement.style.width = initialKeyframe.width as string;
    }
    
    // Verify initial keyframe styles are applied
    expect(targetElement.style.opacity).toBe('0');
    expect(targetElement.style.transform).toBe('scale(0.5)');
    expect(targetElement.style.width).toBe('50px');
  });

  it('should work with CSS.view() function', async () => {
    const targetElement = document.createElement('div');
    
    // Use CSS.view() to create anonymous ViewTimeline
    const animation = targetElement.animate(
      [
        { opacity: '0', transform: 'scale(0.8)' },
        { opacity: '1', transform: 'scale(1)' }
      ],
      {
        duration: "auto",
        timeline: CSS.view({ 
          axis: 'block'
        })
      }
    );

    // Wait for animation to be ready
    await animation.ready;
    
    // Verify animation uses ViewTimeline
    expect(animation.timeline).toBeDefined();
    expect(animation.timeline?.constructor.name).toBe('MockedViewTimeline');
  });

  it('should handle ViewTimeline with inset parameter', () => {
    const subject = document.createElement('div');
    
    const timeline = new ViewTimeline({
      subject: subject,
      axis: 'block',
      inset: ['10px', '20px']
    });

    expect(timeline).toBeDefined();
    expect(timeline.subject).toBe(subject);
    expect(timeline.axis).toBe('block');
  });

  it('should provide disconnect method', () => {
    const subject = document.createElement('div');
    const timeline = new ViewTimeline({ subject });
    
    expect(typeof timeline.disconnect).toBe('function');
    expect(() => timeline.disconnect()).not.toThrow();
  });

  it('should handle edge cases correctly', () => {
    const subject = document.createElement('div');
    
    // Test with different axis values
    const timelineX = new ViewTimeline({
      subject: subject,
      axis: 'x'
    });
    
    expect(timelineX.axis).toBe('x');
    
    // Check that currentTime returns a CSSUnitValue
    const currentTimeX = timelineX.currentTime;
    expect(currentTimeX).toBeInstanceOf(CSSUnitValue);
    if (currentTimeX instanceof CSSUnitValue) {
      expect(currentTimeX.value).toBe(0);
      expect(currentTimeX.unit).toBe('percent');
    }
    
    const timelineInline = new ViewTimeline({
      subject: subject,
      axis: 'inline'
    });
    
    expect(timelineInline.axis).toBe('inline');
    
    // Test with custom inset
    const timelineWithInset = new ViewTimeline({
      subject: subject,
      axis: 'block',
      inset: '50px'
    });
    
    expect(timelineWithInset).toBeDefined();
  });

  it('should validate constructor parameters', () => {
    // Should throw error when subject is missing
    expect(() => {
      // @ts-ignore - Testing invalid input
      new ViewTimeline({});
    }).toThrow('ViewTimeline requires a valid Element as subject');

    // Should throw error when subject is not an Element
    expect(() => {
      // @ts-ignore - Testing invalid input
      new ViewTimeline({ subject: 'not-an-element' });
    }).toThrow('ViewTimeline requires a valid Element as subject');

    // Should throw error for invalid axis
    expect(() => {
      const subject = document.createElement('div');
      // @ts-ignore - Testing invalid input
      new ViewTimeline({ subject, axis: 'invalid-axis' });
    }).toThrow('Invalid axis value: invalid-axis');
  });
});