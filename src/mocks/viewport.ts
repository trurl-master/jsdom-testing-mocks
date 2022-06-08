import mediaQuery, { MediaValues } from 'css-mediaquery';

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

type Handler = () => void;

function mockViewport(desc: ViewportDescription): MockViewport {
  const state: {
    currentDesc: ViewportDescription;
    listenerHandlers: Handler[];
  } = {
    currentDesc: desc,
    listenerHandlers: [],
  };

  const savedImplementation = window.matchMedia;

  const addListener = (handler: Handler) => {
    state.listenerHandlers.push(handler);
  };

  const removeListener = (handler: Handler) => {
    const index = state.listenerHandlers.findIndex(value => value === handler);

    state.listenerHandlers.splice(index, 1);
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      get matches() {
        return mediaQuery.match(query, state.currentDesc);
      },
      media: query,
      onchange: null,
      addListener, // deprecated
      removeListener, // deprecated
      addEventListener: (eventType: string, handler: Handler) => {
        if (eventType === 'change') {
          addListener(handler);
        }
      },
      removeEventListener: (eventType: string, handler: Handler) => {
        if (eventType === 'change') {
          removeListener(handler);
        }
      },
      dispatchEvent: jest.fn(),
    })),
  });

  return {
    cleanup: () => {
      window.matchMedia = savedImplementation;
    },
    set: (newDesc: ViewportDescription) => {
      state.currentDesc = newDesc;
      state.listenerHandlers.forEach(handler => handler());
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
