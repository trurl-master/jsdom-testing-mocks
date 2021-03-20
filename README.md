# jsdom-testing-mocks

A set of tools for emulating browser behavior in jsdom environment

## Installation

```sh
npm install --save-dev jsdom-testing-mocks
```

or

```sh
yarn add -D jsdom-testing-mocks
```

## Mock viewport

Mocks `matchMedia`, allows testing of component's behavior depending on the viewport description (supports all of the [Media Features](http://www.w3.org/TR/css3-mediaqueries/#media1)). `mockViewport` must be called before rendering the component

Example, using `React Testing Library`:

```jsx
import { mockViewport } from 'jsdom-testing-mocks';

it('shows the right lines on desktop and mobile', () => {
  const viewport = mockViewport({ width: '320px', height: '568px' });

  render(<TestComponent />);

  expect(
    screen.getByText('Content visible only on small screens')
  ).toBeInTheDocument();

  expect(
    screen.queryByText('Content visible only on small screens')
  ).not.toBeInTheDocument();

  act(() => {
    viewport.set({ width: '1440px', height: '900px' });
  });

  expect(
    screen.queryByText('Content visible only on small screens')
  ).not.toBeInTheDocument();

  expect(
    screen.getByText('Content visible only on small screens')
  ).toBeInTheDocument();

  viewport.cleanup();
});
```

Also, you can mock the viewport for a group of tests, using `mockViewportForTestGroup`:

```jsx
import { mockViewportForTestGroup } from 'jsdom-testing-mocks'

describe('Desktop specific tests', () => {
  mockViewportForTestGroup({ width: '1440px', height: '900px' })

  test('this', () = {
    // ...
  })

  test('that', () = {
    // ...
  })
})
```

## Mock intersection observer

Provides a way of triggering intersection observer events

Example, using `React Testing Library`:

```jsx
import { mockIntersectionObserver } from 'jsdom-testing-mocks';

const intersectionObserver = mockIntersectionObserver();

it('loads the image when the component is in the viewport', () => {
  const { container } = render(<TestComponent />);

  expect(screen.queryByAltText('alt text')).not.toBeInTheDocument();

  // when the component's observed node is in the viewport - show the image
  act(() => {
    intersectionObserver.enterNode(container.firstChild);
  });

  expect(screen.getByAltText('alt text')).toBeInTheDocument();
});
```

### API

`mockIntersectionObserver` returns an object, that has several useful methods:

#### .enterNode(node, desc) and .leaveNode(node, desc)

Triggers the intersection observer callback with only one node
and `isIntersected` set to `true` (for `enterNode`) or `false` (for `leaveNode`).
Other `IntersectionObserverEntry` params can be passed as `desc` argument

#### .enterAll(desc) and .leaveAll(desc)

Triggers the intersection observer callback for all of the observed nodes
and `isIntersected` set to `true` (for `enterAll`) or `false` (for `leaveAll`).
Other `IntersectionObserverEntry` params can be passed as `desc` argument
