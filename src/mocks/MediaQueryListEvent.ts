import { isJsdomEnv, WrongEnvironmentError } from '../helper';

class MockedMediaQueryListEvent extends Event implements MediaQueryListEvent {
  readonly matches: boolean;
  readonly media: string;

  constructor(type: 'change', eventInitDict: MediaQueryListEventInit = {}) {
    super(type);

    this.media = eventInitDict.media ?? '';
    this.matches = eventInitDict.matches ?? false;
  }
}

function mockMediaQueryListEvent() {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  if (typeof MediaQueryListEvent === 'undefined') {
    Object.defineProperty(window, 'MediaQueryListEvent', {
      writable: true,
      configurable: true,
      value: MockedMediaQueryListEvent,
    });
  }
}

export { MockedMediaQueryListEvent, mockMediaQueryListEvent };
