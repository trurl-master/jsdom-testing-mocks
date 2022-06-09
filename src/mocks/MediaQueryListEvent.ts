export class MockedMediaQueryListEvent extends Event {
  readonly matches: boolean;
  readonly media: string;

  constructor(type: 'change', eventInitDict: MediaQueryListEventInit = {}) {
    super(type);

    this.media = eventInitDict.media ?? '';
    this.matches = eventInitDict.matches ?? false;
  }
}

if (typeof MediaQueryListEvent === 'undefined') {
  Object.defineProperty(window, 'MediaQueryListEvent', {
    writable: true,
    configurable: true,
    value: MockedMediaQueryListEvent,
  });
}
