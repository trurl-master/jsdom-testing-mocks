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
npm i -D jsdom-testing-mocks
```

or

```sh
yarn add -D jsdom-testing-mocks
```

## Mocks

[matchMedia](#mock-viewport),
[Intersection Observer](#mock-intersectionobserver),
[Resize Observer](#mock-resizeobserver),
[Web Animations API](#mock-web-animations-api)

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

Mocks `ResizeObserver` class. Resize callbacks are triggered manually using `resize` method returned by the mock. Elements' size must not be 0 (at least on one axis) for the element to appear in the list of callback entries (you can mock the size using [`mockElementSize`](#mockelementsizeelement-htmlelement-size-size) or `mockElementBoundingClientRect`)

Example, using `React Testing Library`:

```jsx
import { mockResizeObserver } from 'jsdom-testing-mocks';

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

  resizeObserver.mockElementSize(theDiv, {
    contentBoxSize: { inlineSize: 300, blockSize: 200 },
  });

  act(() => {
    // on the first run you don't have to pass the element,
    // it will be included in the list of entries automatically
    // because of the call to .observe
    resizeObserver.resize();
  });

  expect(screen.getByText('300 x 200')).toBeInTheDocument();

  resizeObserver.mockElementSize(theDiv, {
    contentBoxSize: { inlineSize: 200, blockSize: 500 },
  });

  act(() => {
    // on subsequent calls to `resize` you have to include it
    // explicitly, unless observe has been called on it again
    resizeObserver.resize(theDiv);
  });

  expect(screen.getByText('200 x 500')).toBeInTheDocument();
});
```

### Caveats

#### Triggering the callback on observe

Although the mock doesn't call the resize callback on its own, it keeps track of all the cases when it should be implicitly called (like when the element first begins being observed), and it auto-adds them to the list of elements when `resize` is called. You can disable this in `ResizeOptions`

#### Mocking element's size

The mock uses the size provided by `mockElementSize` if present and fallbacks to `getBoundingClientRect` (that you can mock using `mockElementBoundingClientRect`). The issue with `getBoundingClientRect` however is that in the real world the value it returns takes CSS Transforms into account, while the values returned in the observer callback don't. It doesn't really matter because it is you who mocks sizes, but for consistency it is preferred that you use `mockElementSize`

### API

`mockResizeObserver` returns an object, that has several methods:

#### .resize(elements?: HTMLElement | HTMLElement[], options: ResizeOptions)

Triggers all resize observer callbacks for all observers that observe the passed elements. Some elements are implicitly resized by the Resize Observer itself, for example when they first attached using `observe`. This mock doesn't call the callback by itself. Instead, it adds them to the list of `entries` when the next `resize` is called (it happens only once per `observe` per element).

In this example the resize callback will be triggered with all observed elements from within `TestedComponent`:

```jsx
// a component that begins to observe elements in a useEffect
render(<TestedComponent />);

// ...don't forget to mock sizes

act(() => {
  // triggers the `resize` callback with the elements for which `observe` has been called
  resizeObserver.resize();
});
```

##### ResizeOptions.ignoreImplicit (`false` by default)

If `true`, do not include imlicit elements in the resize callback entries array

#### .mockElementSize(element: HTMLElement, size: Size)

Mocks `element`'s size only for the ResizeObserver. `size` accepts 2 properties: `contentBoxSize` and `borderBoxSize` they're both similar to what you see in the ResizeObserver's callback entry. At least one of them must be present (if the other isn't it is set to be equal to the one present), and the other entry properties are derived from these two (and `window.devicePixelRatio`).

Example:

```jsx
mockElementSize(myDiv, {
  // both contentBoxSize and borderBoxSize accept plain objects instead of arrays
  contentBoxSize: { inlineSize: 400, blockSize: 200 },
});

mockElementSize(myOtherDiv, {
  // only one dimension is required, the other one will be assumed to be 0
  borderBoxSize: { inlineSize: 200 },
});
```

#### .getObservers(element?: HTMLElement)

Returns all observers (observing the `element` if passed)

#### .getObservedElements(observer?: ResizeObserver)

Returns all observed elements (of the `observer` if passed)

## Mock Web Animations API

_Warning: **experimental**, bug reports, tests and feedback are greatly appreciated_

Mocks WAAPI functionality using `requestAnimationFrame`. With one important limitation — there are no style interpolations. Each frame applies the closest keyframe from list of passed keyframes or a generated "initial keyframe" if only one keyframe is passed (initial keyframe removes/restores all the properties set by the one keyframe passed). As the implementation is based on the [official spec](https://www.w3.org/TR/web-animations-1/) it should support the majority of cases, but the test suite is far from complete, so _here be dragons_

Example, using `React Testing Library`:

```jsx
import { mockAnimationsApi } from 'jsdom-testing-mocks';

const TestComponent = () => {
  const [isShown, setIsShown] = useState(false);

  return (
    <div>
      {/* AnimatePresence is a component that adds its children in the dom
          and fades it in using WAAPI, with 2 keyframes: [{ opacity: 0 }, { opacity: 1 }],
          also adding a div with the word "Done!" after the animation has finished
          You can find implementation in examples
       */}
      <AnimatePresence>{isShown && <div>Hehey!</div>}</AnimatePresence>
      <button
        onClick={() => {
          setIsShown(true);
        }}
      >
        Show
      </button>
    </div>
  );
};

mockAnimationsApi();

it('adds an element into the dom and fades it in', async () => {
  render(<TestComponent />);

  expect(screen.queryByText('Hehey!')).not.toBeInTheDocument();

  await userEvent.click(screen.getByText('Show'));

  // assume there's only one animation present in the document at this point
  // in practice it's better to get the running animation from the element itself
  const element = screen.getByText('Hehey!');
  const animation = document.getAnimations()[0];

  // our AnimatePresence implementation has 2 keyframes: opacity: 0 and opacity: 1
  // which allows us to test the visibility of the element, the first keyframe
  // is applied right after the animation is ready
  await animation.ready;

  expect(element).not.toBeVisible();

  // this test will pass right after 50% of the animation is complete
  // because this mock doesn't interpolate keyframes values,
  // but chooses the closest one at each frame
  await waitFor(() => {
    expect(element).toBeVisible();
  });

  // AnimatePresence will also add a div with the text 'Done!' after animation is complete
  await waitFor(() => {
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });
});
```

### Using with fake timers

It's perfectly usable with fake timers, except for the [issue with promises](https://github.com/facebook/jest/issues/2157). Also note that you would need to manually advance timers by the duration of the animation taking frame duration (which currently is set to 16ms in `jest`/`sinon.js`) into account. So if you, say, have an animation with a duration of `300ms`, you will need to advance your timers by the value that is at least the closest multiple of the frame duration, which in this case is `304ms` (`19` frames \* `16ms`). Otherwise the last frame may not fire and the animation won't finish.

### Current issues

- No support for `steps` easings
- Needs more tests

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
