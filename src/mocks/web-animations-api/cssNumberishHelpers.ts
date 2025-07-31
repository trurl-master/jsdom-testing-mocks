import { isJsdomEnv, WrongEnvironmentError } from '../../helper';
import { initCSSTypedOM as mockCSSTypedOM } from '../css-typed-om';


/**
 * Converts CSSNumberish to number, handling null and CSSUnitValue values.
 * @param value - The CSSNumberish value to convert (can be null)
 * @returns The number value in milliseconds, or null if the input is null or cannot be converted
 */
export function cssNumberishToNumber(value: CSSNumberish | null): number | null {
  if (value === null) return null;
  if (typeof value === 'number') return value;

  // Handle CSSUnitValue instances
  if (value instanceof CSSUnitValue) {
    const { unit, value: raw } = value;
    if (unit === 's') return raw * 1000; // seconds to ms
    if (unit === 'ms' || unit === 'number') return raw;
    if (unit === 'percent') return raw; // For scroll-driven animations, treat percentage as raw number
    console.warn(
      `jsdom-testing-mocks: Unsupported CSS unit '${unit}' in cssNumberishToNumber. Returning null.`
    );
    return null;
  }

  // Handle CSSMathValue instances
  if (value instanceof CSSMathValue) {
    // Check the type to determine the appropriate conversion
    const valueType = value.type();
    
    // If it's a time-dimensioned value, try to convert using toSum
    if (valueType.time === 1 && Object.values(valueType).filter(v => v !== 0).length === 1) {
      try {
        // Convert to a sum with milliseconds
        const msSum = value.toSum('ms');
        if (msSum.values.length === 1 && msSum.values[0] instanceof CSSUnitValue) {
          return msSum.values[0].value;
        }
        console.warn(
          'jsdom-testing-mocks: Cannot simplify time-dimensioned CSSMathValue to single millisecond value. Returning null.'
        );
        return null;
      } catch {
        console.warn(
          'jsdom-testing-mocks: Cannot convert time-dimensioned CSSMathValue to milliseconds. Returning null.'
        );
        return null;
      }
    }
    
    // If it's dimensionless (number), try to convert using toSum
    if (Object.values(valueType).every(v => v === 0 || v === undefined)) {
      try {
        // Convert to a sum with numbers
        const numberSum = value.toSum('number');
        if (numberSum.values.length === 1 && numberSum.values[0] instanceof CSSUnitValue) {
          return numberSum.values[0].value;
        }
        console.warn(
          'jsdom-testing-mocks: Cannot simplify dimensionless CSSMathValue to single number value. Returning null.'
        );
        return null;
      } catch {
        console.warn(
          'jsdom-testing-mocks: Cannot convert dimensionless CSSMathValue to number. Returning null.'
        );
        return null;
      }
    }
    
    // For other dimensions, we cannot convert to time/number units
    console.warn(
      'jsdom-testing-mocks: CSSMathValue has incompatible dimensions for animation timing. Returning null.'
    );
    return null;
  }

  console.warn(
    'jsdom-testing-mocks: Unsupported CSSNumberish value in cssNumberishToNumber. Returning null.'
  );
  return null;
}

/**
 * @returns The number value, or the default value if conversion fails
 */
export function cssNumberishToNumberWithDefault(
  value: CSSNumberish | null,
  defaultValue: number
): number {
  const converted = cssNumberishToNumber(value);
  return converted ?? defaultValue;
}

/**
 * Converts a number to CSSNumberish
 * @param value - The number value to convert
 * @returns The number as CSSNumberish
 */
export function numberToCSSNumberish(value: number): CSSNumberish {
  return value;
}

/**
 * Initialize CSS Typed OM mocks in JSDOM environment
 */
export function initCSSTypedOM(): void {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }
  
  mockCSSTypedOM();
}

 