export class MockedMediaQueryListEvent
  extends Event
  implements MediaQueryListEvent
{
  readonly matches: boolean;
  readonly media: string;

  constructor(type: 'change', eventInitDict: MediaQueryListEventInit = {}) {
    super(type);

    this.media = eventInitDict.media ?? '';
    this.matches = eventInitDict.matches ?? false;
  }
}

if (typeof MediaQueryListEvent === 'undefined' && typeof window !== 'undefined') {
  Object.defineProperty(window, 'MediaQueryListEvent', {
    writable: true,
    configurable: true,
    value: MockedMediaQueryListEvent,
  });
}
