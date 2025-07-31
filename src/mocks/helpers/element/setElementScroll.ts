import { mockElementScrollProperties } from './scroll';
import { getConfig } from '../../../tools';

interface SetElementScrollOptions {
  /** The vertical scroll position to set */
  scrollTop?: number;
  /** The horizontal scroll position to set */
  scrollLeft?: number;
  /** The total height of scrollable content (optional) */
  scrollHeight?: number;
  /** The total width of scrollable content (optional) */
  scrollWidth?: number;
  /** Whether to dispatch a scroll event (default: true) */
  dispatchEvent?: boolean;
  /** Whether to update related timelines (default: true) */
  updateTimelines?: boolean;
}

/**
 * Sets element scroll position and optionally triggers scroll events and timeline updates.
 * This is a comprehensive helper for testing scroll-driven animations.
 * 
 * @param element The element to set scroll on
 * @param options Scroll options including position and dimensions
 * 
 * @example
 * ```typescript
 * const container = document.querySelector('.scrollable');
 * const scrollTimeline = new ScrollTimeline({ source: container });
 * 
 * // Simulate scrolling to 50% progress
 * setElementScroll(container, {
 *   scrollTop: 500,
 *   scrollHeight: 1000,
 *   dispatchEvent: true,
 *   updateTimelines: true
 * });
 * 
 * // The scroll event will be dispatched and any ScrollTimelines 
 * // observing this element will be updated
 * ```
 */
export function setElementScroll(
  element: HTMLElement, 
  options: SetElementScrollOptions
): void {
  const {
    scrollTop,
    scrollLeft,
    scrollHeight,
    scrollWidth,
    dispatchEvent = true,
    updateTimelines = true
  } = options;

  // Update scroll properties
  const scrollProps: Parameters<typeof mockElementScrollProperties>[1] = {};
  if (scrollTop !== undefined) scrollProps.scrollTop = scrollTop;
  if (scrollLeft !== undefined) scrollProps.scrollLeft = scrollLeft;
  if (scrollHeight !== undefined) scrollProps.scrollHeight = scrollHeight;
  if (scrollWidth !== undefined) scrollProps.scrollWidth = scrollWidth;

  mockElementScrollProperties(element, scrollProps);

  // Dispatch scroll event if requested
  if (dispatchEvent) {
    const config = getConfig();
    const triggerScrollEvent = () => {
      const scrollEvent = new Event('scroll', {
        bubbles: true,
        cancelable: false
      });
      element.dispatchEvent(scrollEvent);
    };

    if (config.act) {
      config.act(triggerScrollEvent);
    } else {
      triggerScrollEvent();
    }
  }

  // Update timelines if requested
  if (updateTimelines && typeof window !== 'undefined') {
    // Update ScrollTimelines
    if ('ScrollTimeline' in window) {
      // Access the global registry of ScrollTimelines if available
      interface WindowWithScrollTimelines extends Window {
        __scrollTimelines?: WeakMap<Element, Set<{ currentTime: number | null }>>;
      }
      const scrollTimelines = (window as unknown as WindowWithScrollTimelines).__scrollTimelines;
      if (scrollTimelines instanceof WeakMap) {
        const timelines = scrollTimelines.get(element);
        if (timelines instanceof Set) {
          timelines.forEach((timeline) => {
            // Trigger timeline update by accessing currentTime
            // This will cause the timeline to recalculate based on new scroll position
            void timeline.currentTime;
          });
        }
      }
    }

    // Update ViewTimelines  
    if ('ViewTimeline' in window) {
      // ViewTimelines calculate visibility based on scroll position.
      // The scroll event will trigger the ViewTimeline to recalculate progress.
      interface WindowWithViewTimelines extends Window {
        __viewTimelines?: WeakMap<Element, Set<{ currentTime: number | null }>>;
      }
      const viewTimelines = (window as unknown as WindowWithViewTimelines).__viewTimelines;
      if (viewTimelines instanceof WeakMap) {
        const timelines = viewTimelines.get(element);
        if (timelines instanceof Set) {
          timelines.forEach((timeline) => {
            // Trigger timeline update by accessing currentTime
            void timeline.currentTime;
          });
        }
      }
    }

    // Trigger any animations connected to these timelines
    if ('document' in window && typeof document.getAnimations === 'function') {
      const animations = document.getAnimations();
      animations.forEach(animation => {
        const timeline = animation.timeline;
        if (timeline && (timeline.constructor.name === 'ScrollTimeline' || 
                        timeline.constructor.name === 'ViewTimeline' ||
                        timeline.constructor.name === 'MockedScrollTimeline' ||
                        timeline.constructor.name === 'MockedViewTimeline')) {
          // Force animation to update by accessing currentTime
          void animation.currentTime;
        }
      });
    }
  }
}

/**
 * Simulates smooth scrolling to a position over multiple frames.
 * Useful for testing animations that respond to continuous scroll changes.
 * 
 * @param element The element to scroll
 * @param targetScrollTop The target scroll position
 * @param options Additional options for the scroll simulation
 * @returns Promise that resolves when scrolling is complete
 * 
 * @example
 * ```typescript
 * await simulateSmoothScroll(container, 500, {
 *   duration: 300,
 *   scrollHeight: 1000
 * });
 * ```
 */
export async function simulateSmoothScroll(
  element: HTMLElement,
  targetScrollTop: number,
  options: {
    duration?: number;
    scrollHeight?: number;
    scrollWidth?: number;
    steps?: number;
  } = {}
): Promise<void> {
  const {
    duration = 300,
    scrollHeight,
    scrollWidth,
    steps = 10
  } = options;

  const startScrollTop = element.scrollTop || 0;
  const distance = targetScrollTop - startScrollTop;
  const stepDuration = duration / steps;

  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const easeProgress = easeInOutQuad(progress);
    const currentScrollTop = startScrollTop + (distance * easeProgress);

    setElementScroll(element, {
      scrollTop: currentScrollTop,
      scrollHeight,
      scrollWidth
    });

    // Wait for next frame
    await new Promise(resolve => setTimeout(resolve, stepDuration));
  }
}

// Easing function for smooth scroll simulation
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}