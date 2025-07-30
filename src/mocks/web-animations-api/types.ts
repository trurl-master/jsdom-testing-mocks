// TypeScript declarations for ScrollTimeline and ViewTimeline APIs

declare global {
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

  interface ViewTimeline extends AnimationTimeline {
    readonly subject: Element;
    readonly axis: 'block' | 'inline' | 'x' | 'y';
  }

  interface ViewTimelineConstructor {
    new (options: {
      subject: Element;
      axis?: 'block' | 'inline' | 'x' | 'y';
      inset?: string | Array<string>;
    }): ViewTimeline;
    prototype: ViewTimeline;
  }

  var ScrollTimeline: ScrollTimelineConstructor;
  var ViewTimeline: ViewTimelineConstructor;
}

export {};