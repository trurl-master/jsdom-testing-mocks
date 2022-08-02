class MockedAnimationPlaybackEvent
  extends Event
  implements AnimationPlaybackEvent
{
  readonly currentTime = null;
  readonly timelineTime = null;
}

function mockAnimationPlaybackEvent() {
  if (typeof AnimationPlaybackEvent === 'undefined') {
    Object.defineProperty(window, 'AnimationPlaybackEvent', {
      writable: true,
      configurable: true,
      value: MockedAnimationPlaybackEvent,
    });
  }
}

export { mockAnimationPlaybackEvent };
