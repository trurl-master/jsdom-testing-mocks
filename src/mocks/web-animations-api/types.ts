// TypeScript declarations for ScrollTimeline and ViewTimeline APIs
// Based on the W3C Scroll-driven Animations specification:
// https://drafts.csswg.org/scroll-animations-1/

declare global {
  // ScrollTimeline interface as defined in the W3C spec
  interface ScrollTimeline extends AnimationTimeline {
    readonly source: Element | null;
    readonly axis: 'block' | 'inline' | 'x' | 'y';
  }

  interface ScrollTimelineConstructor {
    new (options?: {
      source?: Element | null;
      axis?: 'block' | 'inline' | 'x' | 'y';
    }): ScrollTimeline;
    prototype: ScrollTimeline;
  }

  // ViewTimeline interface as defined in the W3C spec
  interface ViewTimeline extends ScrollTimeline {
    readonly subject: Element;
    readonly startOffset: CSSNumericValue;
    readonly endOffset: CSSNumericValue;
    disconnect(): void;
  }

  interface ViewTimelineConstructor {
    new (options: {
      subject: Element;
      axis?: 'block' | 'inline' | 'x' | 'y';
      inset?: string | string[];
    }): ViewTimeline;
    prototype: ViewTimeline;
  }

  // Element.animate() options extension for timeline support
  interface KeyframeAnimationOptions extends KeyframeEffectOptions {
    timeline?: AnimationTimeline | null;
  }

  // CSS Scroll functions - implementing the future spec for testing
  interface CSSScrollFunction {
    (options?: {
      source?: Element | 'nearest' | 'root' | 'self';
      axis?: 'block' | 'inline' | 'x' | 'y';
    }): ScrollTimeline;
  }
  
  interface CSSViewFunction {
    (options?: {
      axis?: 'block' | 'inline' | 'x' | 'y';
      inset?: string | string[];
    }): ViewTimeline;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace CSS {
    var scroll: CSSScrollFunction;
    var view: CSSViewFunction;
  }

  var ScrollTimeline: ScrollTimelineConstructor;
  var ViewTimeline: ViewTimelineConstructor;
}

export {};