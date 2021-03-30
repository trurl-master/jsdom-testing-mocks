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
