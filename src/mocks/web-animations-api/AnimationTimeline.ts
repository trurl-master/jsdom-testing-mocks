class MockedAnimationTimeline implements AnimationTimeline {
  get currentTime() {
    return performance.now();
  }
}

if (typeof AnimationTimeline === "undefined") {
  Object.defineProperty(window, "AnimationTimeline", {
    writable: true,
    configurable: true,
    value: MockedAnimationTimeline,
  });
}
