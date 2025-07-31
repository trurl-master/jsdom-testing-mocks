interface ClientProperties {
  /** The inner height of element in pixels, including padding but excluding border/margin/scrollbar */
  clientHeight?: number;
  /** The inner width of element in pixels, including padding but excluding border/margin/scrollbar */
  clientWidth?: number;
}

/**
 * Mock element client size properties for testing layouts and dimensions.
 * 
 * Client dimensions represent the visible area of an element, including padding
 * but excluding borders, margins, and scrollbars.
 * 
 * @param element The element to mock client properties on
 * @param clientProperties Object containing the client properties to mock
 * @returns Function to restore original property descriptors
 * 
 * @example
 * ```typescript
 * const element = document.createElement('div');
 * 
 * // Mock the visible area of an element
 * const restore = mockElementClientProperties(element, {
 *   clientHeight: 200,        // Visible height is 200px
 *   clientWidth: 300          // Visible width is 300px
 * });
 * 
 * // Now element.clientHeight === 200, element.clientWidth === 300
 * 
 * // Test scroll progress calculation with mocked scroll and client properties
 * mockElementScrollProperties(element, {
 *   scrollTop: 100,
 *   scrollHeight: 1000
 * });
 * 
 * const progress = element.scrollTop / (element.scrollHeight - element.clientHeight);
 * expect(progress).toBe(0.125); // 100 / (1000 - 200) = 0.125 (12.5%)
 * 
 * // Restore original descriptors when done
 * restore();
 * ```
 */
export const mockElementClientProperties = (
  element: HTMLElement,
  clientProperties: ClientProperties
): (() => void) => {
  const originalDescriptors: Record<string, PropertyDescriptor | undefined> = {};
  
  // Store original descriptors for restoration
  Object.keys(clientProperties).forEach(key => {
    originalDescriptors[key] = Object.getOwnPropertyDescriptor(element, key);
  });

  // Define new properties - only client-related ones
  Object.defineProperties(element, {
    ...(clientProperties.clientHeight !== undefined && {
      clientHeight: { 
        value: clientProperties.clientHeight, 
        writable: true, 
        configurable: true 
      }
    }),
    ...(clientProperties.clientWidth !== undefined && {
      clientWidth: { 
        value: clientProperties.clientWidth, 
        writable: true, 
        configurable: true 
      }
    })
  });

  // Return restore function
  return () => {
    Object.keys(clientProperties).forEach(key => {
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