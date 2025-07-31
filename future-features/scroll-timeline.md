# ScrollTimeline/ViewTimeline API

## Why It's an Issue

Scroll-driven animations are increasingly common (parallax effects, scroll progress bars, reveal animations). Without these APIs, developers cannot test whether animations trigger at correct scroll positions, run at proper rates, or sync with scroll progress. Tests either skip these features or rely on manual scroll event calculations.

## Benefits of Mocking

- Test scroll-triggered animations without actual scrolling
- Verify animation progress matches scroll position
- Test performance optimizations (passive listeners, will-change)
- Enable testing of CSS `animation-timeline` property
- Support testing of modern scroll-based UI patterns

## Implementation Challenges

- Must integrate with existing Web Animations API
- Complex timeline calculation based on scroll position
- ViewTimeline requires intersection logic with elements
- Need to handle both JS and CSS-based scroll animations
- Timeline state management across multiple animations

## Current Implementation Status

| Environment | Status | Notes |
|-------------|---------|--------|
| jsdom | ❌ | No Web Animations API support at all |
| happy-dom | ❌ | Has basic Animation API but no timeline support |
| linkedom | ❌ | No implementation |
| Polyfill | 🔧 | [flackr/scroll-timeline](https://github.com/flackr/scroll-timeline) exists |

## Existing Workarounds

1. **Skip tests**: Most developers don't test scroll animations
2. **Manual calculation**: Track scroll position and manually update animations
3. **Polyfill**: Use flackr/scroll-timeline (large, may have conflicts)
4. **Mock at higher level**: Mock the animation library instead of browser API