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

[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://stand-with-ukraine.pp.ua)

### Mocks

[matchMedia](#mock-viewport)  
[Intersection Observer](#mock-intersectionobserver)  
[Resize Observer](#mock-resizeobserver)  
[Web Animations API](#mock-web-animations-api) (includes ScrollTimeline and ViewTimeline)  
[CSS Typed OM](#mock-css-typed-om)  
[Scroll Methods](#scroll-methods) (scrollTo, scrollBy, scrollIntoView)

## Installation

```sh
npm i -D jsdom-testing-mocks
```

```sh
yarn add -D jsdom-testing-mocks
```

## Setup

### With `react`

To avoid having to wrap everything in `act` calls, you can pass `act` to `configMocks`:

```jsx
import { configMocks } from 'jsdom-testing-mocks';
import { act } from '...';

configMocks({ 
  act,
  // Optional: Configure smooth scrolling behavior
  smoothScrolling: {
    enabled: false, // Enable/disable smooth scrolling (default: false for fast tests)
    duration: 300,  // Animation duration in ms (default: 300)
    steps: 10       // Number of animation frames (default: 10)
  }
});
```

It can be done in a setup file, or in a test file, before rendering the component.

### Configuration Options

You can configure various aspects of the mocks using `configMocks()`:

```javascript
import { configMocks } from 'jsdom-testing-mocks';

configMocks({
  // Test lifecycle hooks (required for some testing frameworks)
  beforeAll,
  afterAll, 
  beforeEach,
  afterEach,
  
  // React integration - avoids wrapping everything in act() calls
  act,
  
  // Scroll behavior configuration
  smoothScrolling: {
    enabled: false,  // Disable smooth scrolling for faster tests (default: false)
    duration: 300,   // Animation duration when enabled (default: 300)
    steps: 10        // Animation frame count when enabled (default: 10)
  }
});
```

### With `vitest`

Some mocks require lifecycle hooks to be defined on the global object. To make it work with vitest, you need to [enable globals in your config](https://vitest.dev/config/#globals). If you don't want to do that you can pass it manually using `configMocks`.

Also, if you're using fake timers, at the time of writing this, vitest doesn't enable faking `performance.now`, `requestAnimationFrame` and `cancelAnimationFrame` by default, so you need to do it manually:

```js
vi.useFakeTimers({
  toFake: [
    // vitests defaults
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'setImmediate',
    'clearImmediate',
    'Date',
    // required for mocks
    'performance',
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ],
});
```

[vitest defaults](https://github.com/vitest-dev/vitest/blob/190c25f902a8c32859c9f62407040dedf5a72cb9/packages/vitest/src/defaults.ts)

## Testing framework support

We aim to support all major testing frameworks that support jsdom. Internally, there are no dependencies on any of them, so it's likely that it will work out of the box. Currently tested and confirmed to work with [jest](https://jestjs.io/), [@swc/jest](https://swc.rs/docs/usage/jest) and [vitest](https://vitest.dev/) (with [some setup](#with-vitest)). If you encounter any problems with other testing frameworks, please open an issue.

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

### ScrollTimeline and ViewTimeline Support

The mock includes complete implementations of **ScrollTimeline** and **ViewTimeline** for scroll-driven animations:

- **ScrollTimeline** - Creates animations driven by scroll position of a container
- **ViewTimeline** - Creates animations driven by an element's visibility in its scroll container

```javascript
import { mockAnimationsApi } from 'jsdom-testing-mocks';

mockAnimationsApi();

// ScrollTimeline example
const container = document.querySelector('.scroll-container');
const scrollTimeline = new ScrollTimeline({
  source: container,
  axis: 'block',
  scrollOffsets: ['0%', '100%']
});

// ViewTimeline example  
const subject = document.querySelector('.animated-element');
const viewTimeline = new ViewTimeline({
  subject: subject,
  axis: 'block',
  inset: ['0px', '0px']
});

// Use with Web Animations API
subject.animate([
  { opacity: 0, transform: 'scale(0.8)' },
  { opacity: 1, transform: 'scale(1)' }
], {
  timeline: viewTimeline,
  duration: 1000
});
```

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

## Using with fake timers

It's perfectly usable with fake timers, except for the [issue with promises](https://github.com/facebook/jest/issues/2157). Also note that you would need to manually advance timers by the duration of the animation taking frame duration (which currently is set to 16ms in `jest`/`sinon.js`) into account. So if you, say, have an animation with a duration of `300ms`, you will need to advance your timers by the value that is at least the closest multiple of the frame duration, which in this case is `304ms` (`19` frames \* `16ms`). Otherwise the last frame may not fire and the animation won't finish.

## Mock CSS Typed OM

Provides a complete implementation of the CSS Typed Object Model Level 1 specification for testing CSS numeric values and calculations. While primarily used internally by the Web Animations API mock, it's available as a standalone feature supporting all major CSS units, mathematical operations, and type checking.

```jsx
import { mockCSSTypedOM } from 'jsdom-testing-mocks';

mockCSSTypedOM();

it('performs CSS calculations correctly', () => {
  const width = CSS.px(100);
  const height = CSS.px(200);
  
  expect(width.add(CSS.px(50)).toString()).toBe('150px');
  expect(width.mul(height).toString()).toBe('calc(100px * 200px)');
  expect(CSS.cm(2.54).to('in').toString()).toBe('1in');
  expect(CSS.px(100).min(CSS.px(200), CSS.px(50)).toString()).toBe('50px');
});

it('enforces type safety', () => {
  // Cannot add incompatible units or use raw numbers
  expect(() => CSS.px(10).add(CSS.em(5))).toThrow();
  expect(() => CSS.px(10).add(5)).toThrow();
  
  // Use CSS.number() for dimensionless values
  expect(CSS.px(10).add(CSS.number(5)).toString()).toBe('calc(10px + 5)');
});
```

Supports all CSS units (length, angle, time, frequency, resolution, flex, percentage), mathematical operations, and enforces type compatibility rules as defined in the [W3C specification](https://www.w3.org/TR/css-typed-om-1/).

## Scroll Methods

Provides native scroll method implementations (`scrollTo`, `scrollBy`, `scrollIntoView`) that properly update scroll properties and trigger scroll events. Essential for testing scroll-driven animations and scroll behavior.

**Supports smooth scrolling behavior** - When `behavior: 'smooth'` is specified, the mock can animate the scroll over multiple frames using configurable settings, or treat it as immediate for faster tests.

### Configuration Options

```javascript
import { mockScrollMethods, configMocks } from 'jsdom-testing-mocks';

// Configure scroll behavior globally (call before using mockScrollMethods)
configMocks({
  smoothScrolling: {
    enabled: false, // Enable/disable smooth scrolling animation (default: false)
    duration: 300,  // Animation duration in ms (default: 300)  
    steps: 10       // Number of animation frames (default: 10)
  }
});
```

**Configuration Options:**
- `enabled: false` - (Default) Treats all scrolling as immediate, ignoring `behavior: 'smooth'` (fastest for tests)
- `enabled: true` - Respects `behavior: 'smooth'` and animates over multiple frames
- `duration` - How long the smooth scroll animation takes 
- `steps` - How many intermediate positions to animate through

### Usage Examples

```javascript
// Mock scroll methods for an element
const element = document.createElement('div');
const restore = mockScrollMethods(element);

// Immediate scrolling (default behavior)
element.scrollTo({ top: 100 });
element.scrollBy(0, 50);

// Smooth scrolling behavior depends on configuration:
// - If enabled: false (default) -> immediate (ignores 'smooth')  
// - If enabled: true -> animates over multiple frames
element.scrollTo({ top: 200, behavior: 'smooth' });
element.scrollBy({ top: 50, behavior: 'smooth' });
element.scrollIntoView({ block: 'center', behavior: 'smooth' });

// All scroll methods work with both element and window
window.scrollTo({ top: 300, behavior: 'smooth' });

// Scroll events are dispatched and ScrollTimelines/ViewTimelines are updated
const scrollTimeline = new ScrollTimeline({ source: element });

// Cleanup when done
restore();
```

### Common Configurations

```javascript
// Default test configuration - all scrolling is immediate (default behavior)
// No configuration needed, this is the default:
// configMocks({ smoothScrolling: { enabled: false } });

// Enable smooth scrolling for animation testing
configMocks({
  smoothScrolling: { enabled: true }  // Use default duration: 300, steps: 10
});

// Custom smooth scrolling - slow, high-fidelity animations  
configMocks({
  smoothScrolling: { 
    enabled: true,
    duration: 1000,  // 1 second animation
    steps: 60        // 60 animation frames
  }
});
```

### Setup File Example

Create a test setup file to configure mocks globally:

```javascript
// test-setup.js or setupTests.js
import { configMocks } from 'jsdom-testing-mocks';
import { act } from '@testing-library/react'; // or your testing framework

configMocks({
  act,
  smoothScrolling: { 
    enabled: false  // Fast tests - disable smooth scrolling
  }
});
```

Then import this in your test configuration (Jest, Vitest, etc.).


## Testing Helpers

Additional utilities for mocking element properties in tests:

### Element Dimensions and Positioning

**`mockElementBoundingClientRect(element, rect)`** - Mock `getBoundingClientRect()` return values for positioning and layout

**`mockDOMRect()`** - Mock `DOMRect` and `DOMRectReadOnly` constructors

### Element Size Properties

**`mockElementClientProperties(element, props)`** - Mock visible area dimensions (`clientHeight`, `clientWidth`, `clientTop`, `clientLeft`)

**`mockElementScrollProperties(element, props)`** - Mock scroll position and content dimensions (`scrollTop`, `scrollLeft`, `scrollHeight`, `scrollWidth`)

### Scroll Testing

**`mockScrollMethods(element)`** - Mock native scroll methods (`scrollTo`, `scrollBy`, `scrollIntoView`) for proper testing

```javascript
import { 
  mockElementScrollProperties, 
  mockElementClientProperties,
  mockScrollMethods 
} from 'jsdom-testing-mocks';

const element = document.createElement('div');

// Mock element dimensions
mockElementClientProperties(element, {
  clientHeight: 200,
  clientWidth: 300
});

// Mock scroll properties
mockElementScrollProperties(element, {
  scrollTop: 100,
  scrollHeight: 1000,
  scrollWidth: 500
});

// Enable native scroll methods
const restore = mockScrollMethods(element);

// Use native scroll methods - they now work properly and trigger events
element.scrollTo({ top: 250, behavior: 'smooth' });

// Test scroll progress
const progress = element.scrollTop / (element.scrollHeight - element.clientHeight);
expect(progress).toBe(0.3125); // 31.25%

// Cleanup when done
restore();
```

## Current issues

- Needs more tests

<!-- prettier-ignore-start -->

[version-badge]: https://img.shields.io/npm/v/jsdom-testing-mocks.svg?style=flat-square
[package]: https://www.npmjs.com/package/jsdom-testing-mocks
[downloads-badge]: https://img.shields.io/npm/dm/jsdom-testing-mocks.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/jsdom-testing-mocks
[license-badge]: https://img.shields.io/npm/l/jsdom-testing-mocks.svg?style=flat-square
[license]: https://github.com/trurl-master/jsdom-testing-mocks/blob/master/LICENSE
[build-status-badge]: https://img.shields.io/github/actions/workflow/status/trurl-master/jsdom-testing-mocks/main.yml?branch=master&style=flat-square
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
