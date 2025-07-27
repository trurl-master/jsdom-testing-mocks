/**
 * Helper functions for converting between CSSNumberish and number types
 * 
 * CSSNumberish can be either a number or CSSNumericValue, but most of our
 * internal logic works with numbers. These helpers provide safe conversion
 * at the boundaries between public APIs and internal implementation.
 */

/**
 * Converts CSSNumberish to number, handling null and CSSUnitValue values.
 * It's aware of time units and converts them to milliseconds, as the
 * Web Animations API typically works with milliseconds. For unsupported types
 * like CSSMathValue (e.g., calc()), it will return null and log a warning.
 * 
 * @param value - The CSSNumberish value to convert
 * @returns The number value in milliseconds, or null if the input is null or cannot be converted
 */
export function cssNumberishToNumber(value: CSSNumberish | null): number | null {
  if (value === null) return null;
  if (typeof value === 'number') return value;

  // Handle CSSUnitValue (e.g., CSS.s(2), CSS.ms(500))
  // We do a safe check in case the class doesn't exist in the JSDOM environment.
  if (typeof CSSUnitValue !== 'undefined' && value instanceof CSSUnitValue) {
    if (value.unit === 's') {
      return value.value * 1000; // Convert seconds to milliseconds
    }
    if (value.unit === 'ms' || value.unit === 'number') {
      return value.value;
    }
    // For other units like 'px', '%', etc., we can't convert to a timeline value.
    console.warn(`jsdom-testing-mocks: Unsupported CSS unit '${value.unit}' in cssNumberishToNumber. Returning null.`);
    return null;
  }
  
  // Handle complex CSSNumericValue types that are not supported by this mock
  if (
    (typeof CSSMathValue !== 'undefined' && value instanceof CSSMathValue)
  ) {
    console.warn(
      `jsdom-testing-mocks: Complex CSSNumericValue (like calc()) are not supported. Returning null.`
    );
    return null;
  }

  // Fallback for any other unknown case. This is unlikely to be hit.
  return Number(value);
}

/**
 * Converts number to CSSNumberish
 * @param value - The number value to convert
 * @returns The CSSNumberish value, or null if the input is null
 */
export function numberToCSSNumberish(value: number | null): CSSNumberish | null {
  return value;
}

/**
 * Converts CSSNumberish to number with a default value
 * @param value - The CSSNumberish value to convert
 * @param defaultValue - The default value to return if conversion fails
 * @returns The number value, or the default value if conversion fails
 */
export function cssNumberishToNumberWithDefault(value: CSSNumberish | null, defaultValue: number): number {
  const converted = cssNumberishToNumber(value);
  return converted ?? defaultValue;
} 