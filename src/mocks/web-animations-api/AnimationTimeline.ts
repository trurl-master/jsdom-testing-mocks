class MockedAnimationTimeline implements AnimationTimeline {
  constructor() {
    if (this.constructor === MockedAnimationTimeline) {
      throw new TypeError('Illegal constructor');
    }
  }

  get currentTime() {
    return performance.now();
  }
}

if (typeof AnimationTimeline === 'undefined') {
  Object.defineProperty(window, 'AnimationTimeline', {
    writable: true,
    configurable: true,
    value: MockedAnimationTimeline,
  });
}
