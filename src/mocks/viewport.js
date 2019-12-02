import mediaQuery from 'css-mediaquery'

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

function mockViewport(desc) {
  const state = {
    currentDesc: desc,
    listenerHandlers: [],
  }

  const savedImplementation = window.matchMedia

  const addListener = (handler) => {
    state.listenerHandlers.push(handler)
  }

  const removeListener = (handler) => {
    const index = state.listenerHandlers.findIndex((value) => value === handler)

    state.listenerHandlers.splice(index, 1)
  }

  window.matchMedia = jest.fn().mockImplementation((query) => ({
    get matches() {
      return mediaQuery.match(query, state.currentDesc)
    },
    media: query,
    onchange: null,
    addListener, // deprecated
    removeListener, // deprecated
    addEventListener: addListener,
    removeEventListener: removeListener,
    dispatchEvent: jest.fn(),
  }))

  return {
    cleanup: () => {
      window.matchMedia = savedImplementation
    },
    set: (newDesc) => {
      state.currentDesc = newDesc

      state.listenerHandlers.forEach((handler) => handler())
    },
  }
}

function mockViewportForTestGroup(desc) {
  let viewport

  beforeAll(() => {
    viewport = mockViewport(desc)
  })

  afterAll(() => {
    viewport.cleanup()
  })

  return viewport
}

export { mockViewport, mockViewportForTestGroup }
