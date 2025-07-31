import {
  mockAnimationTimeline,
  MockedAnimationTimeline,
} from './AnimationTimeline';
import { isJsdomEnv, WrongEnvironmentError } from '../../helper';
import { mockCSSTypedOM } from '../css-typed-om';
import './types';

type ViewTimelineAxis = 'block' | 'inline' | 'x' | 'y';

interface ViewTimelineOptions {
  subject: Element;
  axis?: ViewTimelineAxis;
  inset?: string | Array<string>;
}

// Global registry to track ViewTimelines by their scrollable ancestors
const viewTimelineRegistry = new WeakMap<Element, Set<MockedViewTimeline>>();

class MockedViewTimeline
  extends MockedAnimationTimeline
  implements ViewTimeline
{
  #subject: Element;
  #axis: ViewTimelineAxis = 'block';
  #startOffset: CSSNumericValue;
  #endOffset: CSSNumericValue;
  #currentTime: number = 0; // Mock timeline progress (0-100)
  #scrollContainer: Element | null = null;

  constructor(options: ViewTimelineOptions) {
    super();

    // Validate required subject parameter
    if (!options.subject || !(options.subject instanceof Element)) {
      throw new TypeError('ViewTimeline requires a valid Element as subject');
    }

    // Validate axis parameter
    if (options.axis && !['block', 'inline', 'x', 'y'].includes(options.axis)) {
      throw new TypeError(`Invalid axis value: ${options.axis}`);
    }

    this.#subject = options.subject;
    this.#axis = options.axis ?? 'block';

    // Initialize offset values (mock implementation)
    this.#startOffset = { value: 0, unit: 'px' } as unknown as CSSNumericValue;
    this.#endOffset = { value: 100, unit: '%' } as unknown as CSSNumericValue;

    // Find scrollable ancestor and register for updates
    this.#findScrollContainer();
    this.#registerTimeline();
  }

  #findScrollContainer() {
    // Find the nearest scrollable ancestor
    let element: Element | null = this.#subject.parentElement;
    while (element) {
      const style = window.getComputedStyle(element);
      const overflowY = style.overflowY || style.overflow;
      const overflowX = style.overflowX || style.overflow;
      
      // Check if element has scrollable overflow
      const isScrollableY = overflowY === 'auto' || overflowY === 'scroll';
      const isScrollableX = overflowX === 'auto' || overflowX === 'scroll';
      
      if (isScrollableY || isScrollableX) {
        this.#scrollContainer = element;
        break;
      }
      element = element.parentElement;
    }
    
    // Fallback to document scrolling element
    if (!this.#scrollContainer) {
      this.#scrollContainer = document.scrollingElement || document.documentElement;
    }
  }

  #registerTimeline() {
    if (!this.#scrollContainer) return;

    let timelines = viewTimelineRegistry.get(this.#scrollContainer);
    if (!timelines) {
      timelines = new Set();
      viewTimelineRegistry.set(this.#scrollContainer, timelines);
      
      // Add scroll event listener to update view progress
      this.#scrollContainer.addEventListener('scroll', this.#handleScroll);
    }
    timelines.add(this);
  }

  #handleScroll = () => {
    // Update view progress based on subject visibility
    this.#updateViewProgress();
    
    // Force connected animations to update
    const animations = document.getAnimations();
    animations.forEach(animation => {
      if (animation.timeline === this && animation.playState === 'running') {
        // For view-driven animations, force an immediate style update
        // by calling commitStyles directly
        if ('commitStyles' in animation && typeof animation.commitStyles === 'function') {
          animation.commitStyles();
        }
      }
    });
  }

  #updateViewProgress() {
    if (!this.#scrollContainer || !this.#subject) return;

    const containerRect = this.#scrollContainer.getBoundingClientRect();
    const subjectRect = this.#subject.getBoundingClientRect();
    
    // Calculate progress similar to native API
    // Native API allows negative values when element is entering viewport
    const viewportHeight = containerRect.height;
    const subjectHeight = subjectRect.height;
    
    // Handle edge case where elements have no height
    // This can happen in tests or when elements are not yet rendered
    if (viewportHeight === 0 && subjectHeight === 0) {
      // Keep the current value or default to 0
      return;
    }
    
    // Calculate progress from -100% to 100%
    // -100%: subject completely below viewport
    // 0%: subject top at viewport bottom  
    // 100%: subject bottom at viewport top
    const totalDistance = viewportHeight + subjectHeight;
    
    // Avoid division by zero
    if (totalDistance === 0) {
      this.#currentTime = 0;
      return;
    }
    
    const currentDistance = containerRect.bottom - subjectRect.top;
    const progress = ((currentDistance / totalDistance) * 200) - 100;
    
    this.#currentTime = progress;
  }

  get subject() {
    return this.#subject;
  }

  get axis() {
    return this.#axis;
  }

  get source() {
    // ViewTimeline extends ScrollTimeline, so it should have a source
    // For ViewTimeline, the source is the nearest scrollable ancestor
    return this.#scrollContainer ?? document.scrollingElement ?? document.documentElement;
  }

  get startOffset() {
    return this.#startOffset;
  }

  get endOffset() {
    return this.#endOffset;
  }

  get currentTime(): CSSNumberish | null {
    // Update progress before returning
    this.#updateViewProgress();
    
    // Check if timeline is inactive according to spec
    if (!this.#scrollContainer || !this.#subject) {
      return null;
    }
    
    // Get the computed style to check if principal box exists
    const subjectStyle = window.getComputedStyle(this.#subject);
    if (subjectStyle.display === 'none') {
      // No principal box exists
      return null;
    }
    
    // Check for invalid calculations (NaN)
    if (isNaN(this.#currentTime)) {
      return null;
    }
    
    // In jsdom, getBoundingClientRect returns all zeros for elements
    // This would make the timeline appear inactive, so we need to handle this
    const rect = this.#subject.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.bottom === 0) {
      // This is likely jsdom returning zeros, not a real inactive timeline
      // For testing purposes, return CSS.percent(0) to keep timeline active
      return CSS.percent(this.#currentTime);
    }
    
    // Return proper CSSUnitValue using CSS.percent()
    return CSS.percent(this.#currentTime);
  }

  // Mock method to simulate timeline progress changes for testing
  setProgress(progress: number) {
    this.#currentTime = Math.max(0, Math.min(100, progress));
  }

  disconnect() {
    // Clean up scroll event listener and remove from registry
    if (this.#scrollContainer) {
      const timelines = viewTimelineRegistry.get(this.#scrollContainer);
      if (timelines) {
        timelines.delete(this);
        if (timelines.size === 0) {
          this.#scrollContainer.removeEventListener('scroll', this.#handleScroll);
          viewTimelineRegistry.delete(this.#scrollContainer);
        }
      }
    }
  }
}

function mockCSSView() {
  // Add CSS.view() function to the global CSS object
  if (typeof globalThis.CSS === 'object' && globalThis.CSS !== null) {
    // Add the view function directly to the CSS object
    const cssObject = globalThis.CSS as typeof globalThis.CSS & { view?: unknown };
    cssObject.view = function view(options?: { 
      axis?: 'block' | 'inline' | 'x' | 'y',
      inset?: string | string[]
    }): ViewTimeline {
      // CSS.view() creates an anonymous ViewTimeline
      // Since we don't have a subject in the CSS context, we'll create a placeholder
      // In real usage, this would be associated with the animated element
      const placeholderSubject = document.createElement('div');
      return new MockedViewTimeline({
        subject: placeholderSubject,
        axis: options?.axis ?? 'block',
        inset: options?.inset ?? '0px'
      });
    };
  }
}

function mockViewTimeline() {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  // Initialize CSS Typed OM first to ensure CSS object is available
  mockCSSTypedOM();
  mockAnimationTimeline();

  if (typeof ViewTimeline === 'undefined') {
    Object.defineProperty(window, 'ViewTimeline', {
      writable: true,
      configurable: true,
      value: MockedViewTimeline,
    });
  }

  // Expose the registry for testing utilities
  interface WindowWithViewTimelines extends Window {
    __viewTimelines?: WeakMap<Element, Set<MockedViewTimeline>>;
  }
  (window as unknown as WindowWithViewTimelines).__viewTimelines = viewTimelineRegistry;

  // Mock CSS.view() function
  mockCSSView();
}

export { MockedViewTimeline, mockViewTimeline };