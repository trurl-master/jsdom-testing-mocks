import { setElementScroll, simulateSmoothScroll } from './setElementScroll';
import { mockElementClientProperties } from './client';
import { mockElementBoundingClientRect } from './boundingClientRect';
import { mockAnimationsApi } from '../../web-animations-api';

// Mock animations API before all tests
mockAnimationsApi();

describe('setElementScroll', () => {
  let container: HTMLDivElement;
  let subject: HTMLDivElement;

  beforeEach(() => {
    
    // Create test elements
    container = document.createElement('div');
    container.style.height = '400px';
    container.style.overflow = 'auto';
    document.body.appendChild(container);

    // Mock client properties for container
    mockElementClientProperties(container, {
      clientHeight: 400,
      clientWidth: 300
    });

    // Create scrollable content
    const content = document.createElement('div');
    content.style.height = '1200px';
    container.appendChild(content);

    // Create subject element for ViewTimeline
    subject = document.createElement('div');
    subject.style.height = '100px';
    subject.style.marginTop = '500px';
    content.appendChild(subject);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('basic scroll simulation', () => {
    it('should update element scroll properties', () => {
      setElementScroll(container, {
        scrollTop: 200,
        scrollHeight: 1200
      });

      expect(container.scrollTop).toBe(200);
      expect(container.scrollHeight).toBe(1200);
    });

    it('should dispatch scroll event by default', () => {
      const scrollListener = runner.fn();
      container.addEventListener('scroll', scrollListener);

      setElementScroll(container, {
        scrollTop: 100
      });

      expect(scrollListener).toHaveBeenCalledTimes(1);
      expect(scrollListener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'scroll',
        bubbles: true,
        cancelable: false
      }));
    });

    it('should not dispatch scroll event when dispatchEvent is false', () => {
      const scrollListener = runner.fn();
      container.addEventListener('scroll', scrollListener);

      setElementScroll(container, {
        scrollTop: 100,
        dispatchEvent: false
      });

      expect(scrollListener).not.toHaveBeenCalled();
    });
  });

  describe('ScrollTimeline integration', () => {
    it('should update ScrollTimeline progress when scrolling', () => {
      const scrollTimeline = new ScrollTimeline({
        source: container,
        axis: 'block'
      });

      subject.animate(
        [
          { transform: 'translateX(0px)' },
          { transform: 'translateX(100px)' }
        ],
        {
          duration: 100,
          timeline: scrollTimeline
        }
      );

      // Initially at 0% scroll progress
      const initialTime = scrollTimeline.currentTime;
      expect(initialTime).toBeInstanceOf(CSSUnitValue);
      if (initialTime instanceof CSSUnitValue) {
        expect(initialTime.value).toBe(0);
        expect(initialTime.unit).toBe('percent');
      }

      // Scroll to 50%
      setElementScroll(container, {
        scrollTop: 400, // 400 / (1200 - 400) = 50%
        scrollHeight: 1200
      });

      // ScrollTimeline should update
      const updatedTime = scrollTimeline.currentTime;
      expect(updatedTime).toBeInstanceOf(CSSUnitValue);
      if (updatedTime instanceof CSSUnitValue) {
        expect(updatedTime.value).toBe(50);
        expect(updatedTime.unit).toBe('percent');
      }
    });

    it('should work with CSS.scroll()', () => {
      const scrollTimeline = CSS.scroll({
        source: container,
        axis: 'y'
      });

      expect(scrollTimeline).toBeDefined();
      expect(scrollTimeline.source).toBe(container);

      // Set initial scroll
      setElementScroll(container, {
        scrollTop: 0,
        scrollHeight: 1200
      });

      const initialTime = scrollTimeline.currentTime;
      expect(initialTime).toBeInstanceOf(CSSUnitValue);
      if (initialTime instanceof CSSUnitValue) {
        expect(initialTime.value).toBe(0);
        expect(initialTime.unit).toBe('percent');
      }

      // Scroll to bottom
      setElementScroll(container, {
        scrollTop: 800, // 800 / (1200 - 400) = 100%
        scrollHeight: 1200
      });

      const finalTime = scrollTimeline.currentTime;
      expect(finalTime).toBeInstanceOf(CSSUnitValue);
      if (finalTime instanceof CSSUnitValue) {
        expect(finalTime.value).toBe(100);
        expect(finalTime.unit).toBe('percent');
      }
    });
  });

  describe('ViewTimeline integration', () => {
    it('should update ViewTimeline progress based on element visibility', () => {
      // Mock container's bounding rect
      mockElementBoundingClientRect(container, {
        x: 0,
        y: 0,
        width: 300,
        height: 400
      });

      // Mock subject's initial position (below viewport)
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 500,
        width: 300,
        height: 100
      });

      const viewTimeline = new ViewTimeline({
        subject: subject,
        axis: 'block'
      });

      // Initially not visible (should return CSSUnitValue with negative progress)
      const initialTime = viewTimeline.currentTime;
      expect(initialTime).toBeInstanceOf(CSSUnitValue);
      if (initialTime instanceof CSSUnitValue) {
        expect(initialTime.value).toBeLessThan(0); // Subject is below viewport initially
      }

      // Simulate scroll - subject enters viewport by updating its position
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 200,
        width: 300,
        height: 100
      });

      setElementScroll(container, {
        scrollTop: 300,
        scrollHeight: 1200
      });

      // Subject is now visible, calculate progress
      // currentDistance = 400 - 200 = 200
      // totalDistance = 400 + 100 = 500
      // progress = ((200 / 500) * 200) - 100 = -20%
      const updatedTime = viewTimeline.currentTime;
      expect(updatedTime).toBeInstanceOf(CSSUnitValue);
      if (updatedTime instanceof CSSUnitValue) {
        expect(updatedTime.value).toBe(-20);
      }
    });

    it('should work with CSS.view()', () => {
      const viewTimeline = CSS.view({
        axis: 'block'
      });

      expect(viewTimeline).toBeDefined();
      expect(viewTimeline.axis).toBe('block');
    });
  });

  describe('simulateSmoothScroll', () => {
    it('should simulate smooth scrolling over multiple steps', async () => {
      const scrollValues: number[] = [];
      
      container.addEventListener('scroll', () => {
        scrollValues.push(container.scrollTop);
      });

      await simulateSmoothScroll(container, 400, {
        duration: 100,
        scrollHeight: 1200,
        steps: 5
      });

      // Should have triggered 5 scroll events
      expect(scrollValues).toHaveLength(5);
      
      // Values should progressively increase
      for (let i = 1; i < scrollValues.length; i++) {
        expect(scrollValues[i]).toBeGreaterThan(scrollValues[i - 1]);
      }
      
      // Final value should be the target
      expect(container.scrollTop).toBe(400);
    });
  });
});