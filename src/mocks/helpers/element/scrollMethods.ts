import { setElementScroll, simulateSmoothScroll } from './setElementScroll';
import { getConfig } from '../../../tools';

// W3C CSSOM View specification interfaces
interface ScrollToOptions {
  left?: number;
  top?: number;
  behavior?: ScrollBehavior;
}

interface ScrollIntoViewOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

// Helper to normalize scroll coordinates per CSSOM View spec
function normalizeScrollCoordinate(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) return 0; // Per spec: non-finite values become 0
  return Math.max(0, value); // Ensure non-negative
}

// Helper to normalize scroll deltas (allows negative values for scrollBy)
function normalizeScrollDelta(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) return 0; // Per spec: non-finite values become 0
  return value; // Allow negative values for deltas
}

/**
 * Mocks native scroll methods for elements and window to enable proper testing
 * of scroll behaviors and scroll-driven animations.
 * 
 * This function patches the following methods:
 * - element.scrollTo(x, y) / element.scrollTo(options)
 * - element.scroll(x, y) / element.scroll(options) 
 * - element.scrollBy(x, y) / element.scrollBy(options)
 * - element.scrollIntoView(options)
 * - window.scrollTo() / window.scroll() / window.scrollBy() (when no element provided)
 * 
 * @param element The element to patch scroll methods on. If not provided, patches window methods.
 * @returns Cleanup function to restore original methods
 * 
 * @example
 * ```typescript
 * const element = document.createElement('div');
 * 
 * // Mock scroll methods for the element
 * const restore = mockScrollMethods(element);
 * 
 * // Now you can use native scroll methods in tests
 * element.scrollTo({ top: 100, behavior: 'smooth' });
 * element.scrollBy(0, 50);
 * 
 * // Scroll-driven animations will be updated automatically
 * const scrollTimeline = new ScrollTimeline({ source: element });
 * 
 * // Cleanup when done
 * restore();
 * ```
 */
export function mockScrollMethods(element?: HTMLElement): () => void {
  const config = getConfig();
  const restoreFunctions: (() => void)[] = [];

  // Helper to dispatch scroll events and update timelines
  const dispatchScrollEvent = (target: HTMLElement | Window) => {
    const eventTarget = target as EventTarget;
    const scrollEvent = new Event('scroll', {
      bubbles: true,
      cancelable: false
    });

    const triggerEvent = () => {
      eventTarget.dispatchEvent(scrollEvent);
      
      // Update scroll-driven animation timelines
      updateScrollTimelines(target instanceof Window ? document.documentElement : target);
    };

    if (config.act) {
      config.act(triggerEvent);
    } else {
      triggerEvent();
    }
  };

  // Helper to update scroll-driven animation timelines
  const updateScrollTimelines = (scrollElement: HTMLElement) => {
    if (typeof window === 'undefined') return;

    // Update ScrollTimelines
    if ('ScrollTimeline' in window) {
      interface WindowWithScrollTimelines extends Window {
        __scrollTimelines?: WeakMap<Element, Set<{ currentTime: number | null }>>;
      }
      const scrollTimelines = (window as unknown as WindowWithScrollTimelines).__scrollTimelines;
      if (scrollTimelines instanceof WeakMap) {
        const timelines = scrollTimelines.get(scrollElement);
        if (timelines instanceof Set) {
          timelines.forEach((timeline) => {
            void timeline.currentTime; // Trigger recalculation
          });
        }
      }
    }

    // Update ViewTimelines
    if ('ViewTimeline' in window) {
      interface WindowWithViewTimelines extends Window {
        __viewTimelines?: WeakMap<Element, Set<{ currentTime: number | null }>>;
      }
      const viewTimelines = (window as unknown as WindowWithViewTimelines).__viewTimelines;
      if (viewTimelines instanceof WeakMap) {
        const timelines = viewTimelines.get(scrollElement);
        if (timelines instanceof Set) {
          timelines.forEach((timeline) => {
            void timeline.currentTime; // Trigger recalculation
          });
        }
      }
    }
  };

  if (element) {
    // Mock element scroll methods
    mockElementScrollMethods(element, dispatchScrollEvent, restoreFunctions);
  } else {  
    // Mock window scroll methods
    mockWindowScrollMethods(dispatchScrollEvent, restoreFunctions);
  }

  // Return cleanup function
  return () => {
    restoreFunctions.forEach(restore => restore());
  };
}

function mockElementScrollMethods(
  element: HTMLElement,
  dispatchScrollEvent: (target: HTMLElement | Window) => void,
  restoreFunctions: (() => void)[]
) {
  // Store original methods
  const originalScrollTo = element.scrollTo?.bind(element);
  const originalScroll = element.scroll?.bind(element);
  const originalScrollBy = element.scrollBy?.bind(element);
  const originalScrollIntoView = element.scrollIntoView?.bind(element);

  // Mock scrollTo method - per CSSOM View spec  
  element.scrollTo = function(this: HTMLElement, xOrOptions?: number | ScrollToOptions, y?: number): void {
    let left: number, top: number, behavior: ScrollBehavior = 'auto';
    
    if (typeof xOrOptions === 'object' && xOrOptions !== null) {
      // scrollTo(options) - ScrollToOptions dictionary
      const options = xOrOptions;
      left = normalizeScrollCoordinate(options.left, this.scrollLeft);
      top = normalizeScrollCoordinate(options.top, this.scrollTop);
      behavior = options.behavior ?? 'auto';
    } else if (typeof xOrOptions === 'number' || typeof y === 'number') {
      // scrollTo(x, y) - two numeric arguments
      left = normalizeScrollCoordinate(xOrOptions, 0);
      top = normalizeScrollCoordinate(y, 0);
    } else {
      // Edge case: scrollTo() with no args
      left = this.scrollLeft;
      top = this.scrollTop;
    }

    // Constrain to valid scroll range
    const maxScrollLeft = Math.max(0, this.scrollWidth - this.clientWidth);
    const maxScrollTop = Math.max(0, this.scrollHeight - this.clientHeight);
    
    left = Math.min(left, maxScrollLeft);
    top = Math.min(top, maxScrollTop);

    // Check if we should use smooth scrolling
    const config = getConfig();
    const useSmooth = behavior === 'smooth' && config.smoothScrolling.enabled;
    
    if (useSmooth) {
      // Use smooth scrolling animation
      const currentScrollTop = this.scrollTop;
      const currentScrollLeft = this.scrollLeft;
      
      // Handle horizontal scroll immediately, vertical scroll smoothly (typical browser behavior)
      if (left !== currentScrollLeft) {
        setElementScroll(this, {
          scrollLeft: left,
          dispatchEvent: false,
          updateTimelines: false
        });
      }
      
      if (top !== currentScrollTop) {
        void simulateSmoothScroll(this, top, {
          duration: config.smoothScrolling.duration,
          steps: config.smoothScrolling.steps,
          scrollHeight: this.scrollHeight,
          scrollWidth: this.scrollWidth
        });
      } else if (left !== currentScrollLeft) {
        // Only horizontal scroll needed, dispatch event once
        dispatchScrollEvent(this);
      }
    } else {
      // Use immediate scrolling (default for 'auto' or when smooth is disabled)
      setElementScroll(this, {
        scrollLeft: left,
        scrollTop: top,
        dispatchEvent: true,
        updateTimelines: true
      });
    }
  };

  // Mock scroll method (alias for scrollTo)
  element.scroll = element.scrollTo;

  // Mock scrollBy method - per CSSOM View spec
  element.scrollBy = function(this: HTMLElement, xOrOptions?: number | ScrollToOptions, y?: number): void {
    let deltaX: number, deltaY: number, behavior: ScrollBehavior = 'auto';
    
    if (typeof xOrOptions === 'object' && xOrOptions !== null) {
      // scrollBy(options) - ScrollToOptions dictionary
      const options = xOrOptions;
      // For scrollBy, undefined means no change (delta = 0)
      deltaX = options.left !== undefined ? normalizeScrollDelta(options.left, 0) : 0;
      deltaY = options.top !== undefined ? normalizeScrollDelta(options.top, 0) : 0;
      behavior = options.behavior ?? 'auto';
    } else if (typeof xOrOptions === 'number' || typeof y === 'number') {
      // scrollBy(x, y) - two numeric arguments
      deltaX = normalizeScrollDelta(xOrOptions ?? 0, 0);
      deltaY = normalizeScrollDelta(y ?? 0, 0);
    } else {
      // Edge case: scrollBy() with no args
      deltaX = 0;
      deltaY = 0;
    }

    // Calculate new scroll position
    const newLeft = this.scrollLeft + deltaX;
    const newTop = this.scrollTop + deltaY;

    // Use scrollTo to apply the new position (which handles constraints and behavior)
    if (behavior === 'smooth') {
      this.scrollTo({ left: newLeft, top: newTop, behavior: 'smooth' });
    } else {
      this.scrollTo(newLeft, newTop);
    }
  };

  // Mock scrollIntoView method - per CSSOM View spec
  element.scrollIntoView = function(this: HTMLElement, arg?: boolean | ScrollIntoViewOptions): void {
    // Parse arguments per spec
    let block: ScrollLogicalPosition = 'start';
    let inline: ScrollLogicalPosition = 'nearest';
    let behavior: ScrollBehavior = 'auto';

    if (typeof arg === 'boolean') {
      // Legacy boolean argument: true = align to top, false = align to bottom
      block = arg ? 'start' : 'end';
    } else if (typeof arg === 'object' && arg !== null) {
      // ScrollIntoViewOptions object
      block = arg.block ?? 'start';
      inline = arg.inline ?? 'nearest';
      behavior = arg.behavior ?? 'auto';
    }

    // Find all scrollable ancestors (per spec, we need to scroll all of them)
    const scrollableAncestors: HTMLElement[] = [];
    let current: HTMLElement | null = this.parentElement;
    
    while (current) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY || style.overflow;
      const overflowX = style.overflowX || style.overflow;
      
      if (overflowY === 'auto' || overflowY === 'scroll' || 
          overflowX === 'auto' || overflowX === 'scroll') {
        scrollableAncestors.push(current);
      }
      current = current.parentElement;
    }

    // Always include document scrolling as the final ancestor
    if (scrollableAncestors.length === 0 || 
        scrollableAncestors[scrollableAncestors.length - 1] !== document.documentElement) {
      scrollableAncestors.push(document.documentElement);
    }

    // Scroll each ancestor to bring element into view
    scrollableAncestors.forEach(ancestor => {
      const elementRect = this.getBoundingClientRect();
      const ancestorRect = ancestor.getBoundingClientRect();
      
      // Calculate scroll positions based on alignment options
      let scrollTop = ancestor.scrollTop;
      let scrollLeft = ancestor.scrollLeft;

      // Vertical alignment (block)
      switch (block) {
        case 'start':
          scrollTop += elementRect.top - ancestorRect.top;
          break;
        case 'center':
          scrollTop += elementRect.top - ancestorRect.top - (ancestorRect.height - elementRect.height) / 2;
          break;
        case 'end':
          scrollTop += elementRect.bottom - ancestorRect.bottom;
          break;
        case 'nearest':
          // Scroll only if element is not fully visible
          if (elementRect.top < ancestorRect.top) {
            scrollTop += elementRect.top - ancestorRect.top;
          } else if (elementRect.bottom > ancestorRect.bottom) {
            scrollTop += elementRect.bottom - ancestorRect.bottom;
          }
          break;
      }

      // Horizontal alignment (inline)
      switch (inline) {
        case 'start':
          scrollLeft += elementRect.left - ancestorRect.left;
          break;
        case 'center':
          scrollLeft += elementRect.left - ancestorRect.left - (ancestorRect.width - elementRect.width) / 2;
          break;
        case 'end':
          scrollLeft += elementRect.right - ancestorRect.right;
          break;
        case 'nearest':
          // Scroll only if element is not fully visible
          if (elementRect.left < ancestorRect.left) {
            scrollLeft += elementRect.left - ancestorRect.left;
          } else if (elementRect.right > ancestorRect.right) {
            scrollLeft += elementRect.right - ancestorRect.right;
          }
          break;
      }

      // Apply scroll using appropriate method based on behavior and configuration
      const config = getConfig();
      const useSmooth = behavior === 'smooth' && config.smoothScrolling.enabled;
      
      if (useSmooth) {
        // Use smooth scrolling for scrollIntoView
        const currentScrollTop = ancestor.scrollTop;
        const currentScrollLeft = ancestor.scrollLeft;
        
        // Handle horizontal scroll immediately, vertical scroll smoothly
        if (scrollLeft !== currentScrollLeft) {
          setElementScroll(ancestor, {
            scrollLeft: scrollLeft,
            dispatchEvent: false,
            updateTimelines: false
          });
        }
        
        if (scrollTop !== currentScrollTop) {
          void simulateSmoothScroll(ancestor, scrollTop, {
            duration: config.smoothScrolling.duration,
            steps: config.smoothScrolling.steps,
            scrollHeight: ancestor.scrollHeight,
            scrollWidth: ancestor.scrollWidth
          });
        } else if (scrollLeft !== currentScrollLeft) {
          // Only horizontal scroll needed, dispatch event once
          dispatchScrollEvent(ancestor === document.documentElement ? window : ancestor);
        }
      } else {
        // Use immediate scrolling
        setElementScroll(ancestor, {
          scrollLeft: scrollLeft,
          scrollTop: scrollTop,
          dispatchEvent: true,
          updateTimelines: true
        });
      }
    });
  };

  // Add restore functions
  restoreFunctions.push(() => {
    if (originalScrollTo) element.scrollTo = originalScrollTo;
    if (originalScroll) element.scroll = originalScroll;
    if (originalScrollBy) element.scrollBy = originalScrollBy;
    if (originalScrollIntoView) element.scrollIntoView = originalScrollIntoView;
  });
}

function mockWindowScrollMethods(
  dispatchScrollEvent: (target: HTMLElement | Window) => void,
  restoreFunctions: (() => void)[]
) {
  // Store original methods
  const originalScrollTo = window.scrollTo?.bind(window);
  const originalScroll = window.scroll?.bind(window);
  const originalScrollBy = window.scrollBy?.bind(window);

  // Mock window.scrollTo - per CSSOM View spec
  window.scrollTo = function(xOrOptions?: number | ScrollToOptions, y?: number): void {
    let left: number, top: number, behavior: ScrollBehavior = 'auto';
    
    if (typeof xOrOptions === 'object' && xOrOptions !== null) {
      // scrollTo(options) - ScrollToOptions dictionary
      const options = xOrOptions;
      left = normalizeScrollCoordinate(options.left, window.scrollX);
      top = normalizeScrollCoordinate(options.top, window.scrollY);
      behavior = options.behavior ?? 'auto';
    } else if (typeof xOrOptions === 'number' || typeof y === 'number') {
      // scrollTo(x, y) - two numeric arguments
      left = normalizeScrollCoordinate(xOrOptions, 0);
      top = normalizeScrollCoordinate(y, 0);
    } else {
      // Edge case: scrollTo() with no args
      left = window.scrollX;
      top = window.scrollY;
    }

    // Constrain to document dimensions
    const documentElement = document.documentElement;
    const maxScrollLeft = Math.max(0, documentElement.scrollWidth - window.innerWidth);
    const maxScrollTop = Math.max(0, documentElement.scrollHeight - window.innerHeight);
    
    left = Math.min(left, maxScrollLeft);
    top = Math.min(top, maxScrollTop);

    // Update window scroll properties (maintaining all aliases per spec)
    const updateWindowScrollProps = (scrollLeft: number, scrollTop: number) => {
      Object.defineProperty(window, 'scrollX', {
        value: scrollLeft,
        writable: true,
        configurable: true
      });
      Object.defineProperty(window, 'scrollY', {
        value: scrollTop,
        writable: true,
        configurable: true
      });
      Object.defineProperty(window, 'pageXOffset', {
        value: scrollLeft,
        writable: true,
        configurable: true
      });
      Object.defineProperty(window, 'pageYOffset', {
        value: scrollTop,
        writable: true,
        configurable: true
      });
    };

    // Check if we should use smooth scrolling
    const config = getConfig();
    const useSmooth = behavior === 'smooth' && config.smoothScrolling.enabled;
    
    if (useSmooth) {
      // Use smooth scrolling animation for window
      const currentScrollTop = window.scrollY;
      const currentScrollLeft = window.scrollX;
      
      // Handle horizontal scroll immediately, vertical scroll smoothly
      if (left !== currentScrollLeft) {
        setElementScroll(documentElement, {
          scrollLeft: left,
          dispatchEvent: false,
          updateTimelines: false
        });
        updateWindowScrollProps(left, window.scrollY);
      }
      
      if (top !== currentScrollTop) {
        // For window smooth scroll, use element scroll and sync properties
        void simulateSmoothScroll(documentElement, top, {
          duration: config.smoothScrolling.duration,
          steps: config.smoothScrolling.steps,
          scrollHeight: documentElement.scrollHeight,
          scrollWidth: documentElement.scrollWidth
        });
        // Note: Window properties will be slightly out of sync during animation,
        // but will be correct at the end. This is acceptable for testing.
      } else if (left !== currentScrollLeft) {
        // Only horizontal scroll needed, dispatch event once
        dispatchScrollEvent(window);
      }
    } else {
      // Use immediate scrolling
      setElementScroll(documentElement, {
        scrollLeft: left,
        scrollTop: top,
        dispatchEvent: false,
        updateTimelines: true
      });
      updateWindowScrollProps(left, top);
      dispatchScrollEvent(window);
    }
  };

  // Mock window.scroll (alias for scrollTo)
  window.scroll = window.scrollTo;

  // Mock window.scrollBy - per CSSOM View spec
  window.scrollBy = function(xOrOptions?: number | ScrollToOptions, y?: number): void {
    let deltaX: number, deltaY: number, behavior: ScrollBehavior = 'auto';
    
    if (typeof xOrOptions === 'object' && xOrOptions !== null) {
      // scrollBy(options) - ScrollToOptions dictionary
      const options = xOrOptions;
      deltaX = options.left !== undefined ? normalizeScrollDelta(options.left, 0) : 0;
      deltaY = options.top !== undefined ? normalizeScrollDelta(options.top, 0) : 0;
      behavior = options.behavior ?? 'auto';
    } else if (typeof xOrOptions === 'number' || typeof y === 'number') {
      // scrollBy(x, y) - two numeric arguments
      deltaX = normalizeScrollDelta(xOrOptions ?? 0, 0);
      deltaY = normalizeScrollDelta(y ?? 0, 0);
    } else {
      // Edge case: scrollBy() with no args
      deltaX = 0;
      deltaY = 0;
    }

    // Calculate new scroll position
    const newLeft = window.scrollX + deltaX;
    const newTop = window.scrollY + deltaY;

    // Use scrollTo to apply the new position (which handles constraints and behavior)
    if (behavior === 'smooth') {
      window.scrollTo({ left: newLeft, top: newTop, behavior: 'smooth' });
    } else {
      window.scrollTo(newLeft, newTop);
    }
  };

  // Add restore functions
  restoreFunctions.push(() => {
    if (originalScrollTo) window.scrollTo = originalScrollTo;
    if (originalScroll) window.scroll = originalScroll;
    if (originalScrollBy) window.scrollBy = originalScrollBy;
  });
}