import mediaQuery, { MediaValues } from 'css-mediaquery';
import './MediaQueryListEvent';
import { MockedMediaQueryListEvent } from './MediaQueryListEvent';

/**
 * A tool that allows testing components that use js media queries (matchMedia)
 * `mockViewport` must be called before rendering the component
 * @example using react testing library
 *
 *  const viewport = mockViewport({ width: '320px', height: '568px' })
 *
 *  const { getByText, queryByText } = render(<TestComponent />)
 *
 *  expect(getByText('Content visible only in the phone')).toBeInTheDocument()
 *  expect(queryByText('Content visible only on desktop')).not.toBeInTheDocument()
 *
 *  act(() => {
 *    viewport.set({ width: '1440px', height: '900px' })
 *  })
 *
 *  expect(queryByText('Content visible only on the phone')).not.toBeInTheDocument()
 *  expect(getByText('Content visible only on desktop')).toBeInTheDocument()
 *
 *  viewport.cleanup()
 *
 */

export type ViewportDescription = Partial<MediaValues>;
export type MockViewport = {
  cleanup: () => void;
  set: (newDesc: ViewportDescription) => void;
};

type Listener = (this: MediaQueryList, ev: MockedMediaQueryListEvent) => void;
type ListenerObject = {
  handleEvent: (ev: MockedMediaQueryListEvent) => void;
};
type ListenerOrListenerObject = Listener | ListenerObject;

function isEventListenerObject(
  obj: ListenerOrListenerObject
): obj is ListenerObject {
  return (obj as ListenerObject).handleEvent !== undefined;
}

function mockViewport(desc: ViewportDescription): MockViewport {
  const state: {
    currentDesc: ViewportDescription;
    oldListeners: {
      listener: Listener;
      list: MediaQueryList;
      matches: boolean;
    }[];
    listeners: {
      listener: ListenerOrListenerObject;
      list: MediaQueryList;
      matches: boolean;
    }[];
  } = {
    currentDesc: desc,
    oldListeners: [],
    listeners: [],
  };

  const savedImplementation = window.matchMedia;

  const addOldListener = (
    list: MediaQueryList,
    matches: boolean,
    listener: Listener
  ) => {
    state.oldListeners.push({ listener, matches, list });
  };

  const removeOldListener = (listenerToRemove: Listener) => {
    const index = state.oldListeners.findIndex(
      ({ listener }) => listener === listenerToRemove
    );

    state.oldListeners.splice(index, 1);
  };

  const addListener = (
    list: MediaQueryList,
    matches: boolean,
    listener: ListenerOrListenerObject
  ) => {
    state.listeners.push({ listener, matches, list });
  };

  const removeListener = (listenerToRemove: ListenerOrListenerObject) => {
    const index = state.listeners.findIndex(
      ({ listener }) => listener === listenerToRemove
    );

    state.listeners.splice(index, 1);
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      get matches() {
        return mediaQuery.match(query, state.currentDesc);
      },
      media: query,
      onchange: null,
      addListener: function (listener) {
        if (listener) {
          addOldListener(this, this.matches, listener);
        }
      }, // deprecated
      removeListener: (listener) => {
        if (listener) {
          removeOldListener(listener);
        }
      }, // deprecated
      addEventListener: function (
        eventType: Parameters<MediaQueryList['addEventListener']>[0],
        listener: Parameters<MediaQueryList['addEventListener']>[1]
      ) {
        if (eventType === 'change') {
          addListener(this, this.matches, listener);
        }
      },
      removeEventListener: (
        eventType: Parameters<MediaQueryList['removeEventListener']>[0],
        listener: Parameters<MediaQueryList['removeEventListener']>[1]
      ) => {
        if (eventType === 'change') {
          if (isEventListenerObject(listener)) {
            removeListener(listener.handleEvent);
          } else {
            removeListener(listener);
          }
        }
      },
      dispatchEvent: jest.fn(),
    }),
  });

  return {
    cleanup: () => {
      window.matchMedia = savedImplementation;
    },
    set: (newDesc: ViewportDescription) => {
      state.currentDesc = newDesc;
      state.listeners.forEach(({ listener, matches, list }, listenerIndex) => {
        const newMatches = list.matches;

        if (newMatches !== matches) {
          const changeEvent = new MediaQueryListEvent('change', {
            matches: newMatches,
            media: list.media,
          });

          if (isEventListenerObject(listener)) {
            listener.handleEvent(changeEvent);
          } else {
            listener.call(list, changeEvent);
          }

          state.listeners[listenerIndex].matches = newMatches;
        }
      });

      state.oldListeners.forEach(
        ({ listener, matches, list }, listenerIndex) => {
          const newMatches = list.matches;

          if (newMatches !== matches) {
            const changeEvent = new MediaQueryListEvent('change', {
              matches: newMatches,
              media: list.media,
            });

            listener.call(list, changeEvent);

            state.oldListeners[listenerIndex].matches = newMatches;
          }
        }
      );
    },
  };
}

function mockViewportForTestGroup(desc: ViewportDescription) {
  let viewport: MockViewport;

  beforeAll(() => {
    viewport = mockViewport(desc);
  });

  afterAll(() => {
    viewport.cleanup();
  });
}

export { mockViewport, mockViewportForTestGroup };
