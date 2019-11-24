# jsdom-testing-mocks
A set of tools for emulating browser behavior in jsdom environment

## Installation

```sh
npm install --save-dev jsdom-testing-mocks
```

## Mock viewport
Mocks browser's `matchMedia`, allows testing of component's behavior depending on the viewport description (supports all of the [Media Features](http://www.w3.org/TR/css3-mediaqueries/#media1)). `mockViewport` must be called before rendering the component

Example, using `React Testing Library`:

```jsx
import { mockViewport } from 'jsdom-testing-mocks"

it('shows the right lines on desktop and mobile', () => {
  const viewport = mockViewport({ width: '320px', height: '568px' })

  const { getByText, queryByText } = render(<TestComponent />)

  expect(getByText('Content visible only on the phone')).toBeInTheDocument()
  expect(queryByText('Content visible only on desktop')).not.toBeInTheDocument()

  act(() => {
    viewport.set({ width: '1440px', height: '900px' })
  })

  expect(queryByText('Content visible only on the phone')).not.toBeInTheDocument()
  expect(getByText('Content visible only on desktop')).toBeInTheDocument()

  viewport.cleanup()
})
```

## Mock intersection observer
Mocks intersection observer

Example, using `React Testing Library`:

```jsx
import { mockIntersectionObserver } from 'jsdom-testing-mocks"

const intersectionObserver = mockIntersectionObserver()

it('loads the image when the component is in the viewport', () => {
  const { getByAltText, queryByAltText, getByTestId } =  render(<TestComponent />)

  expect(queryByAltText('alt text')).not.toBeInTheDocument()

  // when this element is in the viewport - show the image
  intersectionObserver.enterNode(getByTestId('trigger'))

  expect(getByAltText('alt text')).toBeInTheDocument()
})
```
