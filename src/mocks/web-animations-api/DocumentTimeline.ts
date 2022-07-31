import {
  mockAnimationTimeline,
  MockedAnimationTimeline,
} from './AnimationTimeline';

class MockedDocumentTimeline
  extends MockedAnimationTimeline
  implements DocumentTimeline
{
  #originTime = 0;

  constructor(options?: DocumentTimelineOptions) {
    super();

    this.#originTime = options?.originTime ?? 0;
  }

  get currentTime() {
    return performance.now() - this.#originTime;
  }
}

function mockDocumentTimeline() {
  mockAnimationTimeline();

  if (typeof DocumentTimeline === 'undefined') {
    Object.defineProperty(window, 'DocumentTimeline', {
      writable: true,
      configurable: true,
      value: MockedDocumentTimeline,
    });

    Object.defineProperty(Document.prototype, 'timeline', {
      writable: true,
      configurable: true,
      value: new MockedDocumentTimeline(),
    });
  }
}

export { mockDocumentTimeline };
