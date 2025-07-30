import {
  mockAnimationTimeline,
  MockedAnimationTimeline,
} from './AnimationTimeline';
import './types';

type ScrollAxis = 'block' | 'inline' | 'x' | 'y';

interface ScrollTimelineOptions {
  source?: Element | null;
  axis?: ScrollAxis;
}

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
  }

  get source() {
    return this.#source;
  }

  get axis() {
    return this.#axis;
  }

  get currentTime() {
    if (!this.#source) {
      return null;
    }

    const element = this.#source as Element;
    
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
      return 0;
    }

    // Calculate progress as a percentage (0-100)
    const progress = Math.max(0, Math.min(1, scrollOffset / scrollMax));
    return progress * 100; // Return as percentage for timeline duration
  }
}

function mockScrollTimeline() {
  mockAnimationTimeline();

  if (typeof ScrollTimeline === 'undefined') {
    Object.defineProperty(window, 'ScrollTimeline', {
      writable: true,
      configurable: true,
      value: MockedScrollTimeline,
    });
  }
}

export { MockedScrollTimeline, mockScrollTimeline };