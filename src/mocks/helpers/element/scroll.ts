interface ScrollProperties {
  /** The current vertical scroll position (number of pixels scrolled from top) */
  scrollTop?: number;
  /** The current horizontal scroll position (number of pixels scrolled from left) */
  scrollLeft?: number;
  /** The total height of content, including content not visible due to overflow */
  scrollHeight?: number;
  /** The total width of content, including content not visible due to overflow */
  scrollWidth?: number;
}

/**
 * Mock element scroll properties for testing scroll-driven animations and layouts.
 * 
 * This utility focuses solely on scroll-related properties (position and content dimensions).
 * For client dimensions, use existing utilities or create a separate mockElementClientSize.
 * For offset dimensions, use mockElementBoundingClientRect.
 * 
 * @param element The element to mock scroll properties on
 * @param scrollProperties Object containing the scroll properties to mock
 * @returns Function to restore original property descriptors
 * 
 * @example
 * ```typescript
 * const element = document.createElement('div');
 * 
 * // Mock a scrollable element with content overflow
 * const restore = mockElementScrollProperties(element, {
 *   scrollTop: 100,           // Currently scrolled 100px from top
 *   scrollHeight: 1000,       // Total content height is 1000px
 *   scrollLeft: 0,            // Not scrolled horizontally
 *   scrollWidth: 300          // Total content width is 300px  
 * });
 * 
 * // Now element.scrollTop === 100, element.scrollHeight === 1000, etc.
 * 
 * // You'll also need client dimensions for scroll progress calculation
 * element.clientHeight = 200; // or use mockElementBoundingClientRect
 * const progress = element.scrollTop / (element.scrollHeight - element.clientHeight);
 * expect(progress).toBe(0.125); // 100 / (1000 - 200) = 0.125 (12.5%)
 * 
 * // Restore original descriptors when done
 * restore();
 * ```
 */
export const mockElementScrollProperties = (
  element: HTMLElement,
  scrollProperties: ScrollProperties
): (() => void) => {
  const originalDescriptors: Record<string, PropertyDescriptor | undefined> = {};
  
  // Store original descriptors for restoration
  Object.keys(scrollProperties).forEach(key => {
    originalDescriptors[key] = Object.getOwnPropertyDescriptor(element, key);
  });

  // Define new properties - only scroll-related ones
  Object.defineProperties(element, {
    ...(scrollProperties.scrollTop !== undefined && {
      scrollTop: { 
        value: scrollProperties.scrollTop, 
        writable: true, 
        configurable: true 
      }
    }),
    ...(scrollProperties.scrollLeft !== undefined && {
      scrollLeft: { 
        value: scrollProperties.scrollLeft, 
        writable: true, 
        configurable: true 
      }
    }),
    ...(scrollProperties.scrollHeight !== undefined && {
      scrollHeight: { 
        value: scrollProperties.scrollHeight, 
        writable: true, 
        configurable: true 
      }
    }),
    ...(scrollProperties.scrollWidth !== undefined && {
      scrollWidth: { 
        value: scrollProperties.scrollWidth, 
        writable: true, 
        configurable: true 
      }
    })
  });

  // Return restore function
  return () => {
    Object.keys(scrollProperties).forEach(key => {
      const originalDescriptor = originalDescriptors[key];
      if (originalDescriptor) {
        Object.defineProperty(element, key, originalDescriptor);
      } else {
        // Use Reflect.deleteProperty for safe property deletion
        Reflect.deleteProperty(element, key);
      }
    });
  };
};