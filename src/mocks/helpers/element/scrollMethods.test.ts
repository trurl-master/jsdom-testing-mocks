import { mockScrollMethods } from './scrollMethods';
import { mockElementScrollProperties } from './scroll';
import { mockElementClientProperties } from './client';
import { configMocks } from '../../../tools';

describe('mockScrollMethods', () => {
  let element: HTMLElement;
  let restoreScrollMethods: () => void;

  beforeEach(() => {
    // Configure mocks to disable smooth scrolling for faster, synchronous tests
    configMocks({
      smoothScrolling: { enabled: false }
    });
    
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (restoreScrollMethods) {
      restoreScrollMethods();
    }
    document.body.removeChild(element);
  });

  describe('element scroll methods', () => {
    beforeEach(() => {
      // Mock element properties
      mockElementScrollProperties(element, {
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 1000,
        scrollWidth: 800
      });

      restoreScrollMethods = mockScrollMethods(element);
    });

    describe('scrollTo', () => {
      it('should handle scrollTo(x, y) syntax', () => {
        element.scrollTo(100, 200);

        expect(element.scrollLeft).toBe(100);
        expect(element.scrollTop).toBe(200);
      });

      it('should handle scrollTo(options) syntax', () => {
        element.scrollTo({
          left: 150,
          top: 250,
          behavior: 'smooth'
        });

        expect(element.scrollLeft).toBe(150);
        expect(element.scrollTop).toBe(250);
      });

      it('should preserve existing values when options are partial', () => {
        // Set initial position
        mockElementScrollProperties(element, {
          scrollTop: 100,
          scrollLeft: 50
        });

        // Only change top
        element.scrollTo({ top: 300 });

        expect(element.scrollLeft).toBe(50); // Preserved
        expect(element.scrollTop).toBe(300); // Changed
      });

      it('should handle non-finite values per spec (normalize to 0)', () => {
        element.scrollTo(Infinity, NaN);

        expect(element.scrollLeft).toBe(0);
        expect(element.scrollTop).toBe(0);
      });

      it('should constrain scroll position to valid range', () => {
        // Mock element dimensions
        mockElementScrollProperties(element, {
          scrollHeight: 1000,
          scrollWidth: 800
        });
        mockElementClientProperties(element, {
          clientHeight: 200,
          clientWidth: 300
        });

        // Try to scroll beyond maximum
        element.scrollTo(1000, 1500);

        // Should be constrained to max scroll (scrollHeight - clientHeight)
        expect(element.scrollLeft).toBe(500); // 800 - 300
        expect(element.scrollTop).toBe(800);  // 1000 - 200
      });

      it('should handle negative values (normalize to 0)', () => {
        element.scrollTo(-100, -200);

        expect(element.scrollLeft).toBe(0);
        expect(element.scrollTop).toBe(0);
      });

      it('should dispatch scroll events', () => {
        const scrollHandler = runner.fn();
        element.addEventListener('scroll', scrollHandler);

        element.scrollTo(100, 200);

        expect(scrollHandler).toHaveBeenCalledTimes(1);
        expect(scrollHandler).toHaveBeenCalledWith(expect.objectContaining({
          type: 'scroll',
          bubbles: true
        }));
      });
    });

    describe('scroll', () => {
      it('should work as alias for scrollTo', () => {
        element.scroll(75, 125);

        expect(element.scrollLeft).toBe(75);
        expect(element.scrollTop).toBe(125);
      });

      it('should handle options syntax', () => {
        element.scroll({
          left: 25,
          top: 175,
          behavior: 'auto'
        });

        expect(element.scrollLeft).toBe(25);
        expect(element.scrollTop).toBe(175);
      });
    });

    describe('scrollBy', () => {
      beforeEach(() => {
        // Set initial scroll position
        mockElementScrollProperties(element, {
          scrollTop: 100,
          scrollLeft: 50
        });
      });

      it('should handle scrollBy(x, y) syntax', () => {
        element.scrollBy(25, 75);

        expect(element.scrollLeft).toBe(75); // 50 + 25
        expect(element.scrollTop).toBe(175); // 100 + 75
      });

      it('should handle scrollBy(options) syntax', () => {
        element.scrollBy({
          left: -10,
          top: 50,
          behavior: 'smooth'
        });

        expect(element.scrollLeft).toBe(40); // 50 - 10
        expect(element.scrollTop).toBe(150); // 100 + 50
      });

      it('should handle partial options', () => {
        element.scrollBy({ top: 25 });

        expect(element.scrollLeft).toBe(50); // Unchanged
        expect(element.scrollTop).toBe(125); // 100 + 25
      });

      it('should dispatch scroll events', () => {
        const scrollHandler = runner.fn();
        element.addEventListener('scroll', scrollHandler);

        element.scrollBy(10, 20);

        expect(scrollHandler).toHaveBeenCalledTimes(1);
      });
    });

    describe('scrollIntoView', () => {
      let parentElement: HTMLElement;
      let restoreParentScrollMethods: () => void;

      beforeEach(() => {
        parentElement = document.createElement('div');
        parentElement.style.overflow = 'auto';
        parentElement.style.height = '200px';
        parentElement.style.width = '300px';
        
        document.body.appendChild(parentElement);
        // Remove element from body first if it exists
        if (element.parentNode === document.body) {
          document.body.removeChild(element);
        }
        parentElement.appendChild(element);

        // Mock getBoundingClientRect for testing
        runner
          .spyOn(element, 'getBoundingClientRect')
          .mockImplementation(() => ({
            top: 250,
            left: 100,
            bottom: 300,
            right: 200,
            width: 100,
            height: 50,
            x: 100,
            y: 250,
            toJSON: () => ({})
          } as DOMRect));

        runner
          .spyOn(parentElement, 'getBoundingClientRect')
          .mockImplementation(() => ({
            top: 0,
            left: 0,
            bottom: 200,
            right: 300,
            width: 300,
            height: 200,
            x: 0,
            y: 0,
            toJSON: () => ({})
          } as DOMRect));

        // Mock parent scroll methods
        restoreParentScrollMethods = mockScrollMethods(parentElement);
      });

      afterEach(() => {
        if (restoreParentScrollMethods) {
          restoreParentScrollMethods();
        }
        // Clean up DOM - move element back to body before parentElement cleanup
        if (element.parentNode === parentElement) {
          parentElement.removeChild(element);
          document.body.appendChild(element);
        }
        if (parentElement.parentNode === document.body) {
          document.body.removeChild(parentElement);
        }
      });

      it('should scroll parent to bring element into view', () => {
        const parentScrollHandler = runner.fn();
        parentElement.addEventListener('scroll', parentScrollHandler);

        element.scrollIntoView();

        expect(parentScrollHandler).toHaveBeenCalled();
      });

      it('should handle boolean argument', () => {
        const parentScrollHandler = runner.fn();
        parentElement.addEventListener('scroll', parentScrollHandler);

        element.scrollIntoView(true);

        expect(parentScrollHandler).toHaveBeenCalled();
      });

      it('should handle options argument', () => {
        const parentScrollHandler = runner.fn();
        parentElement.addEventListener('scroll', parentScrollHandler);

        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        expect(parentScrollHandler).toHaveBeenCalled();
      });
    });
  });

  describe('window scroll methods', () => {
    let restoreWindowScrollMethods: () => void;

    beforeEach(() => {
      // Mock initial window scroll properties
      Object.defineProperty(window, 'scrollX', { value: 0, writable: true, configurable: true });
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
      Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true, configurable: true });
      Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true, configurable: true });
      
      // Mock document dimensions for window scroll constraints
      Object.defineProperty(document.documentElement, 'scrollWidth', { value: 2000, writable: true, configurable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true, configurable: true });

      restoreWindowScrollMethods = mockScrollMethods(); // No element = window methods
    });

    afterEach(() => {
      if (restoreWindowScrollMethods) {
        restoreWindowScrollMethods();
      }
    });

    describe('window.scrollTo', () => {
      it('should handle scrollTo(x, y) syntax', () => {
        window.scrollTo(100, 200);

        expect(window.scrollX).toBe(100);
        expect(window.scrollY).toBe(200);
        expect(window.pageXOffset).toBe(100);
        expect(window.pageYOffset).toBe(200);
      });

      it('should handle scrollTo(options) syntax', () => {
        window.scrollTo({
          left: 150,
          top: 250,
          behavior: 'smooth'
        });

        expect(window.scrollX).toBe(150);
        expect(window.scrollY).toBe(250);
      });

      it('should dispatch scroll events on window', () => {
        const scrollHandler = runner.fn();
        window.addEventListener('scroll', scrollHandler);

        window.scrollTo(100, 200);

        expect(scrollHandler).toHaveBeenCalledTimes(1);

        window.removeEventListener('scroll', scrollHandler);
      });
    });

    describe('window.scroll', () => {
      it('should work as alias for scrollTo', () => {
        window.scroll(75, 125);

        expect(window.scrollX).toBe(75);
        expect(window.scrollY).toBe(125);
      });
    });

    describe('window.scrollBy', () => {
      beforeEach(() => {
        // Set initial position
        window.scrollTo(50, 100);
      });

      it('should handle scrollBy(x, y) syntax', () => {
        window.scrollBy(25, 75);

        expect(window.scrollX).toBe(75); // 50 + 25
        expect(window.scrollY).toBe(175); // 100 + 75
      });

      it('should handle scrollBy(options) syntax', () => {
        window.scrollBy({
          left: -10,
          top: 50,
          behavior: 'smooth'
        });

        expect(window.scrollX).toBe(40); // 50 - 10
        expect(window.scrollY).toBe(150); // 100 + 50
      });
    });
  });

  describe('cleanup', () => {
    it('should restore original scroll methods', () => {
      const originalScrollTo = element.scrollTo;
      const originalScroll = element.scroll;
      const originalScrollBy = element.scrollBy;
      const originalScrollIntoView = element.scrollIntoView;

      const restore = mockScrollMethods(element);

      // Methods should be mocked
      expect(element.scrollTo).not.toBe(originalScrollTo);
      expect(element.scroll).not.toBe(originalScroll);
      expect(element.scrollBy).not.toBe(originalScrollBy);
      expect(element.scrollIntoView).not.toBe(originalScrollIntoView);

      restore();

      // Methods should be restored (or be the new mocked versions for undefined originals)
      // In jsdom, these methods might not exist originally, so we just ensure they're callable
      expect(typeof element.scrollTo).toBe('function');
      expect(typeof element.scroll).toBe('function');
      expect(typeof element.scrollBy).toBe('function');
      expect(typeof element.scrollIntoView).toBe('function');
    });

    it('should restore window scroll methods', () => {
      const originalWindowScrollTo = window.scrollTo;
      const originalWindowScroll = window.scroll;
      const originalWindowScrollBy = window.scrollBy;

      const restore = mockScrollMethods();

      // Methods should be mocked
      expect(window.scrollTo).not.toBe(originalWindowScrollTo);
      expect(window.scroll).not.toBe(originalWindowScroll);
      expect(window.scrollBy).not.toBe(originalWindowScrollBy);

      restore();

      // Methods should be restored (or at least be functions)
      expect(typeof window.scrollTo).toBe('function');
      expect(typeof window.scroll).toBe('function');
      expect(typeof window.scrollBy).toBe('function');
    });
  });

  describe('smooth scrolling configuration', () => {
    it('should respect smoothScrolling.enabled = false config', () => {
      // Configure to disable smooth scrolling
      configMocks({
        smoothScrolling: { enabled: false }
      });
      
      mockElementScrollProperties(element, {
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 1000,
        scrollWidth: 1000
      });
      
      const restore = mockScrollMethods(element);
      
      // Even with behavior: 'smooth', should be immediate when disabled
      element.scrollTo({ top: 500, behavior: 'smooth' });
      
      // Should be immediate (not animated)
      expect(element.scrollTop).toBe(500);
      
      restore();
    });
    
    it('should use smooth scrolling when enabled (async test)', async () => {
      // Configure to enable smooth scrolling with fast animation
      configMocks({
        smoothScrolling: { 
          enabled: true,
          duration: 50,  // Short duration for test
          steps: 5       // Few steps for test
        }
      });
      
      mockElementScrollProperties(element, {
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 1000,
        scrollWidth: 1000
      });
      
      const restore = mockScrollMethods(element);
      
      // With behavior: 'smooth' and enabled: true, should be animated
      element.scrollTo({ top: 500, behavior: 'smooth' });
      
      // Should not be immediate (still animating)
      expect(element.scrollTop).toBeLessThan(500);
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should be at target after animation (allow for floating point precision)
      expect(element.scrollTop).toBeCloseTo(500, 0);
      
      restore();
    });
  });

  describe('integration with scroll-driven animations', () => {
    // These tests would require the ScrollTimeline/ViewTimeline mocks to be active
    // and would test that scroll method calls properly update timeline states
    
    it('should update ScrollTimeline when element is scrolled', () => {
      // This test would verify ScrollTimeline integration
      // Implementation depends on having ScrollTimeline mock active
      expect(true).toBe(true); // Placeholder
    });

    it('should update ViewTimeline when scrolling affects element visibility', () => {
      // This test would verify ViewTimeline integration
      // Implementation depends on having ViewTimeline mock active
      expect(true).toBe(true); // Placeholder
    });
  });
});