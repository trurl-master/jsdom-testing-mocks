import { mockAnimationsApi } from './index';
import { mockElementBoundingClientRect } from '../helpers/element/boundingClientRect';
import { setElementScroll } from '../helpers/element/setElementScroll';

// Mock animations API before tests
mockAnimationsApi();

describe('ViewTimeline Scroll Integration', () => {
  let container: HTMLDivElement;
  let subject: HTMLDivElement;

  beforeEach(() => {
    // Create test elements that mimic the example structure
    container = document.createElement('div');
    container.className = 'scrollable-container';
    container.style.height = '400px';
    container.style.overflowY = 'auto';
    document.body.appendChild(container);
    
    const content = document.createElement('div');
    content.style.height = '1200px';
    container.appendChild(content);
    
    subject = document.createElement('div');
    subject.className = 'subject-element';
    subject.style.height = '100px';
    subject.style.marginTop = '500px';
    content.appendChild(subject);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should update ViewTimeline progress when scrolling', () => {
    // Mock positions - container is the viewport
    mockElementBoundingClientRect(container, {
      x: 0,
      y: 0,
      width: 400,
      height: 400
    });
    
    // Subject initially below viewport
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 500, // Below the 400px viewport
      width: 400,
      height: 100
    });
    
    // Create ViewTimeline
    const viewTimeline = new ViewTimeline({
      subject: subject,
      axis: 'block'
    });
    
    // Initially not visible (should be negative)
    const initialTime = viewTimeline.currentTime;
    expect(initialTime).toBeInstanceOf(CSSUnitValue);
    // CSS.percent() creates a CSSUnitValue, check the value is negative
    if (initialTime instanceof CSSUnitValue) {
      expect(initialTime.value).toBeLessThan(0);
    }
    
    // Move subject into viewport by simulating scroll
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 200, // Now in viewport at 200px from top
      width: 400,
      height: 100
    });
    
    // Trigger scroll event
    setElementScroll(container, {
      scrollTop: 300,
      scrollHeight: 1200
    });
    
    // ViewTimeline should now show progress  
    // With subject.top at 200 and container.bottom at 400:
    // currentDistance = 400 - 200 = 200
    // totalDistance = 400 + 100 = 500
    // progress = ((200 / 500) * 200) - 100 = -20%
    const currentTime = viewTimeline.currentTime;
    if (currentTime instanceof CSSUnitValue) {
      expect(currentTime.value).toBe(-20);
    }
  });

  it('should detect proper scroll container', () => {
    // Create nested structure
    const outerContainer = document.createElement('div');
    outerContainer.style.height = '800px';
    outerContainer.style.overflowY = 'auto';
    document.body.appendChild(outerContainer);
    
    const innerContainer = document.createElement('div');
    innerContainer.style.height = '600px';
    innerContainer.style.overflowY = 'auto';
    outerContainer.appendChild(innerContainer);
    
    const nestedSubject = document.createElement('div');
    nestedSubject.style.height = '100px';
    innerContainer.appendChild(nestedSubject);
    
    const viewTimeline = new ViewTimeline({
      subject: nestedSubject,
      axis: 'block'
    });
    
    // Should find the nearest scrollable ancestor (innerContainer)
    expect(viewTimeline.source).toBe(innerContainer);
    
    // Cleanup
    document.body.removeChild(outerContainer);
  });

  it('should handle subject entering and leaving viewport', () => {
    // Mock container position
    mockElementBoundingClientRect(container, {
      x: 0,
      y: 0,
      width: 400,
      height: 400
    });
    
    const viewTimeline = new ViewTimeline({
      subject: subject,
      axis: 'block'
    });
    
    // Case 1: Subject below viewport (not yet visible)
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 500, // Below viewport
      width: 400,
      height: 100
    });
    
    setElementScroll(container, { scrollTop: 0 });
    const timeWhenBelow = viewTimeline.currentTime;
    if (timeWhenBelow instanceof CSSUnitValue) {
      expect(timeWhenBelow.value).toBeLessThan(-50);
    }
    
    // Case 2: Subject entering viewport from bottom
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 350, // Bottom 50px visible
      width: 400,
      height: 100
    });
    
    setElementScroll(container, { scrollTop: 150 });
    const enteringTime = viewTimeline.currentTime;
    if (enteringTime instanceof CSSUnitValue) {
      expect(enteringTime.value).toBeGreaterThan(-100);
      expect(enteringTime.value).toBeLessThan(0);
    }
    
    // Case 3: Subject fully in viewport
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: 200, // Centered in viewport
      width: 400,
      height: 100
    });
    
    setElementScroll(container, { scrollTop: 300 });
    const centeredTime = viewTimeline.currentTime;
    if (centeredTime instanceof CSSUnitValue) {
      expect(centeredTime.value).toBe(-20); // ((400-200)/(400+100) * 200) - 100 = -20%
    }
    
    // Case 4: Subject above viewport (scrolled past)
    mockElementBoundingClientRect(subject, {
      x: 0,
      y: -150, // Completely above viewport
      width: 400,
      height: 100
    });
    
    setElementScroll(container, { scrollTop: 600 });
    const timeWhenAbove = viewTimeline.currentTime;
    if (timeWhenAbove instanceof CSSUnitValue) {
      expect(timeWhenAbove.value).toBeGreaterThan(50);
    }
  });

  describe('ViewTimeline Progress Calculation (Spec Compliance)', () => {
    let container: HTMLDivElement;
    let subject: HTMLDivElement;
    let viewTimeline: ViewTimeline;

    beforeEach(() => {
      container = document.createElement('div');
      // Make container scrollable so ViewTimeline can find it
      container.style.overflowY = 'auto';
      container.style.height = '400px';
      document.body.appendChild(container);
      
      subject = document.createElement('div');
      container.appendChild(subject);
      
      // Standard viewport: 400px high
      mockElementBoundingClientRect(container, {
        x: 0,
        y: 0,
        width: 400,
        height: 400
      });

      viewTimeline = new ViewTimeline({
        subject: subject,
        axis: 'block'
      });
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return -100% when subject top is at viewport bottom (0% progress point)', () => {
      // Subject height: 100px, positioned so its top is at viewport bottom
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 400, // subject.top = container.bottom = 400
        width: 400,
        height: 100
      });

      // currentDistance = 400 - 400 = 0
      // progress = ((0 / 500) * 200) - 100 = -100%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBe(-100);
      }
    });

    it('should return 0% when subject is centered in viewport', () => {
      // Subject positioned so it's exactly centered in viewport
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 150, // Center subject in 400px viewport (400/2 - 100/2 = 150)
        width: 400,
        height: 100
      });

      // currentDistance = 400 - 150 = 250
      // totalDistance = 400 + 100 = 500
      // progress = ((250 / 500) * 200) - 100 = 0%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBe(0);
      }
    });

    it('should return 100% when subject bottom is at viewport top (100% progress point)', () => {
      // Subject positioned so its bottom is at viewport top
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: -100, // subject.bottom (y + height) = 0 = container.top
        width: 400,
        height: 100
      });

      // currentDistance = 400 - (-100) = 500
      // progress = ((500 / 500) * 200) - 100 = 100%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBe(100);
      }
    });

    it('should return values less than -100% when subject is far below viewport', () => {
      // Subject positioned far below viewport
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 600, // Far below viewport
        width: 400,
        height: 100
      });

      // currentDistance = 400 - 600 = -200
      // progress = ((-200 / 500) * 200) - 100 = -180%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBe(-180);
      }
    });

    it('should return values greater than 100% when subject is far above viewport', () => {
      // Subject positioned far above viewport
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: -300, // Far above viewport
        width: 400,
        height: 100
      });

      // currentDistance = 400 - (-300) = 700
      // progress = ((700 / 500) * 200) - 100 = 180%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBe(180);
      }
    });

    it('should handle different subject heights correctly', () => {
      // Test with a taller subject (200px)
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 300, // Subject top at y=300
        width: 400,
        height: 200
      });

      // totalDistance = 400 + 200 = 600
      // currentDistance = 400 - 300 = 100
      // progress = ((100 / 600) * 200) - 100 = -66.67%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBeCloseTo(-66.67, 2);
      }
    });

    it('should handle different viewport heights correctly', () => {
      // Test with different viewport height
      mockElementBoundingClientRect(container, {
        x: 0,
        y: 0,
        width: 400,
        height: 600 // Taller viewport
      });

      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 450, // Subject positioned relative to new viewport
        width: 400,
        height: 100
      });

      // totalDistance = 600 + 100 = 700
      // currentDistance = 600 - 450 = 150
      // progress = ((150 / 700) * 200) - 100 = -57.14%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBeCloseTo(-57.14, 2);
      }
    });

    it('should return consistent values across multiple calculations', () => {
      // Set initial position
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 200,
        width: 400,
        height: 100
      });

      const time1 = viewTimeline.currentTime;
      const time2 = viewTimeline.currentTime;

      // Should return identical values
      if (time1 instanceof CSSUnitValue && time2 instanceof CSSUnitValue) {
        expect(time1.value).toBe(time2.value);
        expect(time1.unit).toBe(time2.unit);
      }
    });

    it('should handle edge case where viewport and subject have same height', () => {
      // Subject same height as viewport
      mockElementBoundingClientRect(subject, {
        x: 0,
        y: 200, // Subject top at y=200
        width: 400,
        height: 400 // Same as viewport height
      });

      // totalDistance = 400 + 400 = 800
      // currentDistance = 400 - 200 = 200
      // progress = ((200 / 800) * 200) - 100 = -50%
      const currentTime = viewTimeline.currentTime;
      if (currentTime instanceof CSSUnitValue) {
        expect(currentTime.value).toBe(-50);
      }
    });
  });
});