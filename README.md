# jsdom-testing-mocks

A set of tools for emulating browser behavior in jsdom environment

[![Build status][build-status-badge]][build-status]
[![version][version-badge]][package]
[![PRs Welcome][prs-badge]][prs]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![Code of Conduct][coc-badge]][coc]

[![GitHub Repo stars][star-badge]][star]
[![Twitter URL][twitter-badge]][twitter]

## Installation

```sh
npm i --D jsdom-testing-mocks
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
    screen.queryByText('Content visible only on large screens')
  ).not.toBeInTheDocument();

  act(() => {
    viewport.set({ width: '1440px', height: '900px' });
  });

  expect(
    screen.queryByText('Content visible only on small screens')
  ).not.toBeInTheDocument();

  expect(
    screen.getByText('Content visible only on large screens')
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

## Mock IntersectionObserver

Provides a way of triggering intersection observer events

Example, using `React Testing Library`:

```jsx
import { mockIntersectionObserver } from 'jsdom-testing-mocks';

const io = mockIntersectionObserver();

/*
Assuming html:
<div data-testid="container">
  <img src="..." alt="alt text" />
</div>

And an IntersectionObserver, observing the container
*/
it('loads the image when the component is in the viewport', () => {
  const { container } = render(<TestComponent />);

  expect(screen.queryByAltText('alt text')).not.toBeInTheDocument();

  // when the component's observed node is in the viewport - show the image
  act(() => {
    io.enterNode(screen.getByTestId('container'));
  });

  expect(screen.getByAltText('alt text')).toBeInTheDocument();
});
```

### API

`mockIntersectionObserver` returns an object, that has several useful methods:

#### .enterNode(node, desc)

Triggers all IntersectionObservers observing the `node`, with `isIntersected` set to `true` and `intersectionRatio` set to `1`. Other `IntersectionObserverEntry` params can be passed as `desc` argument, you can override any parameter except `isIntersected`

#### .leaveNode(node, desc)

Triggers all IntersectionObservers observing the `node`, with `isIntersected` set to `false` and `intersectionRatio` set to `0`. Other `IntersectionObserverEntry` params can be passed as `desc` argument, you can override any parameter except `isIntersected`

#### .enterNodes(nodeDescriptions)

Triggers all IntersectionObservers observing the nodes in `nodeDescriptions` with multiple nodes entering at once. Each IntersectionObserver callback will receive only the nodes it's observing:

```js
io.enterNodes([
  // you can pass multiple nodes each with its own state
  { node: screen.getByText('First Node'), desc: { intersectionRatio: 0.5 } },
  // description is optional:
  { node: screen.getByText('Second Node') },
  // or you can use a shorthand:
  screen.getByText('Third Node'),
]);
```

#### .leaveNodes(nodeDescriptions)

Triggers all IntersectionObservers observing the nodes in `nodeDescriptions` with multiple nodes leaving at once. Each IntersectionObserver callback will receive only the nodes it's observing.

#### .triggerNodes(nodeDescriptions)

Triggers all IntersectionObservers observing the nodes in `nodeDescriptions` with multiple nodes at once with custom descriptions (`isIntersected` is not enforced). Each IntersectionObserver callback will receive only the nodes it's observing

#### .enterAll(desc) and .leaveAll(desc)

Triggers all IntersectionObservers for each of the observed nodes

## Mock ResizeObserver

Provides a way of triggering resize observer events. It's up to you to mock elements' sizes. If your component uses `contentRect` provided by the callback, you must mock element's `getBoundingClientRect` (for exemple using a helper function `mockElementBoundingClientRect` provided by the lib)

_Currently the mock doesn't take into account multi-column layouts, so `borderBoxSize` and `contentBoxSize` will contain only one full-sized item_

Example, using `React Testing Library`:

```jsx
import {
  mockResizeObserver,
  mockElementBoundingClientRect,
} from 'jsdom-testing-mocks';

const DivWithSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setSize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div data-testid="theDiv" ref={ref}>
      {size.width} x {size.height}
    </div>
  );
};

const resizeObserver = mockResizeObserver();

it('prints the size of the div', () => {
  render(<DivWithSize />);

  const theDiv = screen.getByTestId('theDiv');

  expect(screen.getByText('0 x 0')).toBeInTheDocument();

  mockElementBoundingClientRect(theDiv, { width: 300, height: 200 });

  act(() => {
    resizeObserver.resize(theDiv);
  });

  expect(screen.getByText('300 x 200')).toBeInTheDocument();

  mockElementBoundingClientRect(theDiv, { width: 200, height: 500 });

  act(() => {
    resizeObserver.resize(theDiv);
  });

  expect(screen.getByText('200 x 500')).toBeInTheDocument();
});
```

### API

`mockResizeObserver` returns an object, that has one method:

#### .resize(elements: HTMLElement | HTMLElement[])

Triggers all resize observer callbacks for all observers that observe the passed elements

<!-- prettier-ignore-start -->

[version-badge]: https://img.shields.io/npm/v/jsdom-testing-mocks.svg?style=flat-square
[package]: https://www.npmjs.com/package/jsdom-testing-mocks
[downloads-badge]: https://img.shields.io/npm/dm/jsdom-testing-mocks.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/jsdom-testing-mocks
[license-badge]: https://img.shields.io/npm/l/jsdom-testing-mocks.svg?style=flat-square
[license]: https://github.com/trurl-master/jsdom-testing-mocks/blob/master/LICENSE
[build-status-badge]: https://img.shields.io/github/workflow/status/trurl-master/jsdom-testing-mocks/CI?style=flat-square
[build-status]: https://github.com/trurl-master/jsdom-testing-mocks/actions/workflows/main.yml
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/trurl-master/jsdom-testing-mocks/blob/master/CODE_OF_CONDUCT.md
[star-badge]: https://img.shields.io/github/stars/trurl-master/jsdom-testing-mocks?style=social
[star]: https://github.com/trurl-master/jsdom-testing-mocks/stargazers
[twitter-badge]: https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Ftrurl-master%2Fjsdom-testing-mocks
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20jsdom-testing-mocks%20by%20@ivangaliatin%20https%3A%2F%2Fgithub.com%2Ftrurl-master%2Fjsdom-testing-mocks


<!-- prettier-ignore-end -->
