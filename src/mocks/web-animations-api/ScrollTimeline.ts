import {
  mockAnimationTimeline,
  MockedAnimationTimeline,
} from './AnimationTimeline';
import { isJsdomEnv, WrongEnvironmentError } from '../../helper';
import { mockCSSTypedOM } from '../css-typed-om';
import './types';

type ScrollAxis = 'block' | 'inline' | 'x' | 'y';

interface ScrollTimelineOptions {
  source?: Element | null;
  axis?: ScrollAxis;
}

// Global registry to track ScrollTimelines by their source elements
const scrollTimelineRegistry = new WeakMap<Element, Set<MockedScrollTimeline>>();

class MockedScrollTimeline
  extends MockedAnimationTimeline
  implements ScrollTimeline
{
  #source: Element | null = null;
  #axis: ScrollAxis = 'block';

  constructor(options?: ScrollTimelineOptions) {
    super();

    // Validate axis parameter
    if (options?.axis && !['block', 'inline', 'x', 'y'].includes(options.axis)) {
      throw new TypeError(`Invalid axis value: ${options.axis}`);
    }

    this.#source = options?.source ?? document.scrollingElement ?? document.documentElement;
    this.#axis = options?.axis ?? 'block';
    
    // Ensure we have a valid source element
    if (!this.#source) {
      throw new Error('No scroll source available');
    }

    // Register this timeline with its source element
    this.#registerTimeline();
  }

  #registerTimeline() {
    if (!this.#source) return;

    let timelines = scrollTimelineRegistry.get(this.#source);
    if (!timelines) {
      timelines = new Set();
      scrollTimelineRegistry.set(this.#source, timelines);
      
      // Add scroll event listener to update animations
      this.#source.addEventListener('scroll', this.#handleScroll);
    }
    timelines.add(this);
  }

  #handleScroll = () => {
    // When scroll occurs, animations using this timeline need to update
    // For scroll-driven animations, we need to trigger a style update immediately
    const animations = document.getAnimations();
    animations.forEach(animation => {
      if (animation.timeline === this && animation.playState === 'running') {
        // For scroll-driven animations, force an immediate style update
        // by calling commitStyles directly
        if ('commitStyles' in animation && typeof animation.commitStyles === 'function') {
          animation.commitStyles();
        }
      }
    });
  }

  get source() {
    return this.#source;
  }

  get axis() {
    return this.#axis;
  }

  get currentTime(): CSSNumberish | null {
    if (!this.#source) {
      return null;
    }

    const element = this.#source;
    
    // Calculate scroll position based on axis
    let scrollOffset: number;
    let scrollMax: number;

    switch (this.#axis) {
      case 'block':
      case 'y':
        scrollOffset = element.scrollTop;
        scrollMax = element.scrollHeight - element.clientHeight;
        break;
      case 'inline':
      case 'x':
        scrollOffset = element.scrollLeft;
        scrollMax = element.scrollWidth - element.clientWidth;
        break;
      default:
        scrollOffset = element.scrollTop;
        scrollMax = element.scrollHeight - element.clientHeight;
    }

    // Avoid division by zero
    if (scrollMax <= 0) {
      return CSS.percent(0);
    }

    // Calculate progress as a percentage (0-100) and return as CSSUnitValue
    const progress = Math.max(0, Math.min(1, scrollOffset / scrollMax));
    const percentage = progress * 100;
    return CSS.percent(percentage);
  }
}

function mockCSSScroll() {
  // Add CSS.scroll() function to the global CSS object
  if (typeof globalThis.CSS === 'object' && globalThis.CSS !== null) {
    if (!globalThis.CSS.scroll) {
      Object.defineProperty(globalThis.CSS, 'scroll', {
        writable: true,
        configurable: true,
        value: function scroll(options?: { 
          source?: Element | 'nearest' | 'root' | 'self', 
          axis?: 'block' | 'inline' | 'x' | 'y' 
        }): ScrollTimeline {
          // Handle scroller parameter
          let source: Element | null = null;
          
          if (!options?.source || options.source === 'nearest') {
            // Default: nearest scrollable ancestor (for simplicity, use document.scrollingElement)
            source = document.scrollingElement ?? document.documentElement;
          } else if (options.source === 'root') {
            // Root scroller
            source = document.scrollingElement ?? document.documentElement;
          } else if (options.source === 'self') {
            // Self - would be the element being animated, but in this context we'll use document
            source = document.scrollingElement ?? document.documentElement;
          } else if (options.source instanceof Element) {
            // Specific element
            source = options.source;
          }

          return new MockedScrollTimeline({
            source,
            axis: options?.axis ?? 'block'
          });
        }
      });
    }
  }
}

function mockScrollTimeline() {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  // Initialize CSS Typed OM first to ensure CSS object is available
  mockCSSTypedOM();
  mockAnimationTimeline();

  if (typeof ScrollTimeline === 'undefined') {
    Object.defineProperty(window, 'ScrollTimeline', {
      writable: true,
      configurable: true,
      value: MockedScrollTimeline,
    });
  }

  // Expose the registry for testing utilities
  interface WindowWithScrollTimelines extends Window {
    __scrollTimelines?: WeakMap<Element, Set<MockedScrollTimeline>>;
  }
  (window as unknown as WindowWithScrollTimelines).__scrollTimelines = scrollTimelineRegistry;

  mockCSSScroll();
}

export { MockedScrollTimeline, mockScrollTimeline };