import {
  mockAnimationTimeline,
  MockedAnimationTimeline,
} from './AnimationTimeline';
import './types';

type ViewTimelineAxis = 'block' | 'inline' | 'x' | 'y';

interface ViewTimelineOptions {
  subject: Element;
  axis?: ViewTimelineAxis;
  inset?: string | Array<string>;
}

class MockedViewTimeline
  extends MockedAnimationTimeline
  implements ViewTimeline
{
  #subject: Element;
  #axis: ViewTimelineAxis = 'block';
  #inset: string | Array<string> = '0px';
  #observer: IntersectionObserver | null = null;
  #isIntersecting = false;
  #intersectionRatio = 0;

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
    this.#inset = options.inset ?? '0px';

    this.#setupIntersectionObserver();
  }

  get subject() {
    return this.#subject;
  }

  get axis() {
    return this.#axis;
  }

  get currentTime() {
    if (!this.#isIntersecting) {
      return null;
    }

    // Calculate timeline progress based on intersection ratio
    // When fully visible (intersectionRatio = 1), timeline is at 100%
    // When partially visible, timeline progress is proportional
    return this.#intersectionRatio * 100;
  }

  #setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback when IntersectionObserver is not available
      return;
    }

    // Parse inset values for rootMargin
    const rootMargin = Array.isArray(this.#inset) 
      ? this.#inset.join(' ')
      : this.#inset;

    this.#observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          this.#isIntersecting = entry.isIntersecting;
          this.#intersectionRatio = entry.intersectionRatio;
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin,
        threshold: [0, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds for smooth animation
      }
    );

    this.#observer.observe(this.#subject);
  }

  disconnect() {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }
}

function mockViewTimeline() {
  mockAnimationTimeline();

  if (typeof ViewTimeline === 'undefined') {
    Object.defineProperty(window, 'ViewTimeline', {
      writable: true,
      configurable: true,
      value: MockedViewTimeline,
    });
  }
}

export { MockedViewTimeline, mockViewTimeline };