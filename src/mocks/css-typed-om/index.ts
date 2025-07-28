import { isJsdomEnv, WrongEnvironmentError } from '../../helper';

/**
 * CSS Typed OM Implementation
 * 
 * A comprehensive polyfill for CSS Typed Object Model Level 1
 * Based on the W3C specification: https://www.w3.org/TR/css-typed-om-1/
 * 
 * This implementation includes:
 * - CSSNumericValue (base class)
 * - CSSUnitValue (single unit values)
 * - CSSMathValue and subclasses (math expressions)
 * - Unit conversion and type checking
 * - Full arithmetic operations
 */

// ============================================================================
// Types and Constants
// ============================================================================

/**
 * CSS numeric base types as defined in the specification
 */
type CSSNumericBaseType = 'length' | 'angle' | 'time' | 'frequency' | 'resolution' | 'flex' | 'percent';

/**
 * CSS math operators
 */
type CSSMathOperator = 'sum' | 'product' | 'negate' | 'invert' | 'min' | 'max' | 'clamp';

/**
 * CSS numeric type representing the dimensional analysis of a value
 */
interface CSSNumericType {
  length: number;
  angle: number;
  time: number;
  frequency: number;
  resolution: number;
  flex: number;
  percent: number;
  percentHint?: CSSNumericBaseType;
}

/**
 * Unit conversion table for compatible units
 */
const UNIT_CONVERSIONS: Record<string, { canonical: string; factor: number }> = {
  // Length units (canonical: px)
  'px': { canonical: 'px', factor: 1 },
  'in': { canonical: 'px', factor: 96 },
  'cm': { canonical: 'px', factor: 96 / 2.54 },
  'mm': { canonical: 'px', factor: 96 / 25.4 },
  'pt': { canonical: 'px', factor: 96 / 72 },
  'pc': { canonical: 'px', factor: 96 / 6 },
  'Q': { canonical: 'px', factor: 96 / 101.6 },
  
  // Angle units (canonical: deg)
  'deg': { canonical: 'deg', factor: 1 },
  'rad': { canonical: 'deg', factor: 180 / Math.PI },
  'grad': { canonical: 'deg', factor: 0.9 },
  'turn': { canonical: 'deg', factor: 360 },
  
  // Time units (canonical: ms)
  'ms': { canonical: 'ms', factor: 1 },
  's': { canonical: 'ms', factor: 1000 },
  
  // Frequency units (canonical: Hz)
  'Hz': { canonical: 'Hz', factor: 1 },
  'kHz': { canonical: 'Hz', factor: 1000 },
  
  // Resolution units (canonical: dppx)
  'dppx': { canonical: 'dppx', factor: 1 },
  'dpi': { canonical: 'dppx', factor: 1 / 96 },
  'dpcm': { canonical: 'dppx', factor: 2.54 / 96 },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets the base type for a given unit
 */
function getBaseType(unit: string): CSSNumericBaseType | null {
  if (unit === 'number') return null;
  if (unit === 'percent') return 'percent';
  
  // Length units - comprehensive list
  const lengthUnits = [
    // Absolute
    'px', 'in', 'cm', 'mm', 'pt', 'pc', 'Q',
    // Font-relative
    'em', 'rem', 'ex', 'ch', 'cap', 'ic', 'lh', 'rlh',
    // Viewport-relative (original)
    'vw', 'vh', 'vi', 'vb', 'vmin', 'vmax',
    // Viewport-relative (small)
    'svw', 'svh', 'svi', 'svb', 'svmin', 'svmax',
    // Viewport-relative (large)
    'lvw', 'lvh', 'lvi', 'lvb', 'lvmin', 'lvmax',
    // Viewport-relative (dynamic)
    'dvw', 'dvh', 'dvi', 'dvb', 'dvmin', 'dvmax',
    // Container query
    'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax'
  ];
  
  if (lengthUnits.includes(unit)) return 'length';
  if (['deg', 'rad', 'grad', 'turn'].includes(unit)) return 'angle';
  if (['ms', 's'].includes(unit)) return 'time';
  if (['Hz', 'kHz'].includes(unit)) return 'frequency';
  if (['dppx', 'dpi', 'dpcm'].includes(unit)) return 'resolution';
  if (unit === 'fr') return 'flex';
  return null;
}

/**
 * Creates a CSS numeric type from a unit (sparse - only non-zero properties)
 */
function createTypeFromUnit(unit: string): CSSNumericType {
  const baseType = getBaseType(unit);
  if (baseType && baseType !== 'percent') {
    const result: Partial<CSSNumericType> = {};
    result[baseType] = 1;
    return result as CSSNumericType;
  } else if (baseType === 'percent') {
    return { percent: 1 } as CSSNumericType;
  }
  return {} as CSSNumericType; // Empty object for dimensionless numbers
}

/**
 * Adds two CSS numeric types
 */
function addTypes(type1: CSSNumericType, type2: CSSNumericType): CSSNumericType | null {
  // For addition, types must be compatible (same dimensions)
  const result: CSSNumericType = { ...type1 };
  
  // Check if both are numbers (empty objects or all zeros)
  const isType1Number = Object.keys(type1).length === 0 || Object.values(type1).every(v => v === 0 || v === undefined);
  const isType2Number = Object.keys(type2).length === 0 || Object.values(type2).every(v => v === 0 || v === undefined);
  
  // Numbers can only be added to other numbers
  if (isType1Number && isType2Number) {
    return {} as CSSNumericType; // Return empty object for numbers
  }
  
  // If one is number and other isn't, it's incompatible for addition
  if (isType1Number || isType2Number) {
    return null;
  }
  
  // Check if types are compatible for addition (same dimensions)
  const keys: Array<keyof CSSNumericType> = ['length', 'angle', 'time', 'frequency', 'resolution', 'flex', 'percent'];
  for (const key of keys) {
    if (key === 'percentHint') continue;
    if ((type1[key] || 0) !== (type2[key] || 0)) {
      return null;
    }
  }
  
  return result;
}

/**
 * Multiplies two CSS numeric types
 */
function multiplyTypes(type1: CSSNumericType, type2: CSSNumericType): CSSNumericType {
  const result: CSSNumericType = {
    length: type1.length + type2.length,
    angle: type1.angle + type2.angle,
    time: type1.time + type2.time,
    frequency: type1.frequency + type2.frequency,
    resolution: type1.resolution + type2.resolution,
    flex: type1.flex + type2.flex,
    percent: type1.percent + type2.percent
  };
  
  return result;
}

/**
 * Converts a unit to its canonical form if possible
 */
function convertUnit(value: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return value;
  
  const fromConversion = UNIT_CONVERSIONS[fromUnit];
  const toConversion = UNIT_CONVERSIONS[toUnit];
  
  if (!fromConversion || !toConversion) return null;
  if (fromConversion.canonical !== toConversion.canonical) return null;
  
  // Convert: value * fromFactor / toFactor
  const result = value * fromConversion.factor / toConversion.factor;
  
  // Round to match browser precision - use fewer decimal places to match browser behavior
  return Math.round(result * 10000) / 10000;
}

/**
 * Gets the canonical unit for a given unit
 */
function getCanonicalUnit(unit: string): string {
  const conversion = UNIT_CONVERSIONS[unit];
  return conversion ? conversion.canonical : unit;
}

/**
 * Converts a CSSNumberish value to a CSSNumericValue
 */
function rectifyNumberish(value: CSSNumberish, allowDirectNumbers = false): MockedCSSNumericValue {
  if (typeof value === 'number') {
    if (allowDirectNumbers) {
      return new MockedCSSUnitValue(value, 'number');
    }
    throw new TypeError('Numbers cannot be used directly in CSS Typed OM operations. Use CSS.number() to create a CSSNumericValue.');
  }
  if (value instanceof MockedCSSNumericValue) {
    return value;
  }
  throw new TypeError('Invalid CSSNumberish value');
}

// ============================================================================
// CSSNumericValue (Base Class)
// ============================================================================

/**
 * Base class for all CSS numeric values
 */
abstract class MockedCSSNumericValue implements CSSNumericValue {
  constructor() {
    if (new.target === MockedCSSNumericValue) {
      throw new TypeError('Cannot instantiate abstract class MockedCSSNumericValue directly');
    }
  }
  /**
   * Returns the type of this numeric value
   */
  abstract type(): CSSNumericType;

  /**
   * Adds one or more values to this value
   */
  add(...values: CSSNumberish[]): CSSNumericValue {
    if (values.length === 0) return this;
    
    // Check for raw numbers - they should throw
    if (values.some(v => typeof v === 'number')) {
      throw new TypeError('Cannot add numbers directly. Use CSS.number() instead.');
    }
    
    const operands = [this, ...values.map(v => rectifyNumberish(v))];
    
    // Try to simplify if all are CSSUnitValue with same unit
    if (operands.every(op => op instanceof MockedCSSUnitValue)) {
      const unitValues = operands as MockedCSSUnitValue[];
      const firstUnit = unitValues[0].unit;
      if (unitValues.every(uv => uv.unit === firstUnit)) {
        const sum = unitValues.reduce((acc, uv) => acc + uv.value, 0);
        return new MockedCSSUnitValue(sum, firstUnit);
      }
    }
    
    // Special case: if all are numbers, simplify
    if (operands.every(op => op instanceof MockedCSSUnitValue && op.unit === 'number')) {
      const sum = operands.reduce((acc, op) => acc + (op as MockedCSSUnitValue).value, 0);
      return new MockedCSSUnitValue(sum, 'number');
    }
    
    // Check type compatibility
    let resultType = this.type();
    for (let i = 1; i < operands.length; i++) {
      const opType = operands[i].type();
      const addedType = addTypes(resultType, opType);
      if (addedType === null) {
        throw new TypeError('Incompatible types for addition');
      }
      resultType = addedType;
    }
    
    return new MockedCSSMathSum(operands);
  }

  /**
   * Subtracts one or more values from this value
   */
  sub(...values: CSSNumberish[]): CSSNumericValue {
    if (values.length === 0) return this;
    
    // Check for raw numbers - they should throw
    if (values.some(v => typeof v === 'number')) {
      throw new TypeError('Cannot subtract numbers directly. Use CSS.number() instead.');
    }
    
    const negatedValues = values.map(v => {
      const numeric = rectifyNumberish(v);
      return numeric.negate();
    });
    return this.add(...negatedValues);
  }

  /**
   * Multiplies this value by one or more values
   */
  mul(...values: CSSNumberish[]): CSSNumericValue {
    if (values.length === 0) return this;
    
    const operands = [this, ...values.map(v => rectifyNumberish(v, true))];
    
    // Try to simplify if all are numbers or one unit with numbers
    if (operands.every(op => op instanceof MockedCSSUnitValue)) {
      const unitValues = operands as MockedCSSUnitValue[];
      const numbers = unitValues.filter(uv => uv.unit === 'number');
      const nonNumbers = unitValues.filter(uv => uv.unit !== 'number');
      
      if (nonNumbers.length <= 1) {
        const numberProduct = numbers.reduce((acc, uv) => acc * uv.value, 1);
        if (nonNumbers.length === 0) {
          return new MockedCSSUnitValue(numberProduct, 'number');
        } else {
          const singleUnit = nonNumbers[0];
          return new MockedCSSUnitValue(numberProduct * singleUnit.value, singleUnit.unit);
        }
      }
    }
    
    return new MockedCSSMathProduct(operands);
  }

  /**
   * Divides this value by one or more values
   */
  div(...values: CSSNumberish[]): CSSNumericValue {
    if (values.length === 0) return this;
    
    const invertedValues = values.map(v => {
      const numeric = rectifyNumberish(v, true);
      if (numeric instanceof MockedCSSUnitValue && numeric.value === 0) {
        throw new RangeError('Cannot divide by zero');
      }
      return numeric.invert();
    });
    return this.mul(...invertedValues);
  }

  /**
   * Returns the minimum of this value and one or more other values
   */
  min(...values: CSSNumberish[]): CSSNumericValue {
    if (values.length === 0) return this;
    
    // Per CSS Typed OM spec, throw TypeError for raw numbers instead of returning null
    // This follows the spec rather than quirky browser behavior, providing better type safety
    if (values.some(v => typeof v === 'number')) {
      throw new TypeError('Cannot use raw numbers in min(). Use CSS.number() instead.');
    }
    
    const operands = [this, ...values.map(v => rectifyNumberish(v))];
    
    // Try to simplify if all are CSSUnitValue with same unit
    if (operands.every(op => op instanceof MockedCSSUnitValue)) {
      const unitValues = operands as MockedCSSUnitValue[];
      const firstUnit = unitValues[0].unit;
      if (unitValues.every(uv => uv.unit === firstUnit)) {
        const minValue = Math.min(...unitValues.map(uv => uv.value));
        return new MockedCSSUnitValue(minValue, firstUnit);
      }
    }
    
    return new MockedCSSMathMin(operands);
  }

  /**
   * Returns the maximum of this value and one or more other values
   */
  max(...values: CSSNumberish[]): CSSNumericValue {
    if (values.length === 0) return this;
    
    // Per CSS Typed OM spec, throw TypeError for raw numbers instead of returning null
    // This follows the spec rather than quirky browser behavior, providing better type safety
    if (values.some(v => typeof v === 'number')) {
      throw new TypeError('Cannot use raw numbers in max(). Use CSS.number() instead.');
    }
    
    const operands = [this, ...values.map(v => rectifyNumberish(v))];
    
    // Try to simplify if all are CSSUnitValue with same unit
    if (operands.every(op => op instanceof MockedCSSUnitValue)) {
      const unitValues = operands as MockedCSSUnitValue[];
      const firstUnit = unitValues[0].unit;
      if (unitValues.every(uv => uv.unit === firstUnit)) {
        const maxValue = Math.max(...unitValues.map(uv => uv.value));
        return new MockedCSSUnitValue(maxValue, firstUnit);
      }
    }
    
    return new MockedCSSMathMax(operands);
  }

  /**
   * Checks if this value equals one or more other values
   */
  equals(...values: CSSNumberish[]): boolean {
    for (const value of values) {
      const numeric = rectifyNumberish(value);
      if (!this.isEqualTo(numeric)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Converts this value to the specified unit
   */
  to(unit: string): CSSUnitValue {
    if (!(this instanceof MockedCSSUnitValue)) {
      throw new TypeError('Cannot convert complex values to a single unit');
    }
    
    const converted = convertUnit(this.value, this.unit, unit);
    if (converted === null) {
      throw new TypeError(`Cannot convert from '${this.unit}' to '${unit}'`);
    }
    
    return new MockedCSSUnitValue(converted, unit);
  }

  /**
   * Converts this value to a sum of the specified units
   */
  toSum(...units: string[]): CSSMathSum {
    // For simplicity, if no units specified, return this as a sum
    if (units.length === 0) {
      if (this instanceof MockedCSSMathSum) {
        return this;
      }
      return new MockedCSSMathSum([this]);
    }
    
    // If this is a simple unit value, try to convert to requested units
    if (this instanceof MockedCSSUnitValue) {
      const results: MockedCSSUnitValue[] = [];
      const sourceUnit = this.unit;
      let foundCompatible = false;
      
      for (const targetUnit of units) {
        // Check if units are compatible
        const converted = convertUnit(this.value, sourceUnit, targetUnit);
        if (converted !== null && !foundCompatible) {
          // Put all value in the first compatible unit
          results.push(new MockedCSSUnitValue(converted, targetUnit));
          foundCompatible = true;
        } else {
          // Incompatible unit or already used compatible unit, add zero
          results.push(new MockedCSSUnitValue(0, targetUnit));
        }
      }
      
      if (!foundCompatible) {
        throw new TypeError(`Cannot convert ${sourceUnit} to any of the specified units`);
      }
      
      return new MockedCSSMathSum(results);
    }
    
    // For complex values, try to simplify first
    if (this instanceof MockedCSSMathSum) {
      // Group values by compatible units
      const groups = new Map<string, MockedCSSUnitValue[]>();
      
      for (const value of this.values) {
        if (value instanceof MockedCSSUnitValue) {
          const key = getCanonicalUnit(value.unit);
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)?.push(value);
        }
      }
      
      const results: MockedCSSUnitValue[] = [];
      
      for (const targetUnit of units) {
        const canonicalUnit = getCanonicalUnit(targetUnit);
        const compatibleValues = groups.get(canonicalUnit) || [];
        
        if (compatibleValues.length > 0) {
          // Sum all compatible values and convert to target unit
          let sum = 0;
          for (const val of compatibleValues) {
            const converted = convertUnit(val.value, val.unit, targetUnit);
            if (converted !== null) {
              sum += converted;
            }
          }
          results.push(new MockedCSSUnitValue(sum, targetUnit));
          groups.delete(canonicalUnit);
        } else {
          results.push(new MockedCSSUnitValue(0, targetUnit));
        }
      }
      
      // Check if any groups remain (incompatible units)
      if (groups.size > 0) {
        throw new TypeError('Some values cannot be converted to the specified units');
      }
      
      return new MockedCSSMathSum(results);
    }
    
    throw new TypeError('Cannot convert complex math expressions to sum');
  }

  /**
   * Negates this value
   */
  negate(): CSSNumericValue {
    if (this instanceof MockedCSSUnitValue) {
      return new MockedCSSUnitValue(-this.value, this.unit);
    }
    return new MockedCSSMathNegate(this);
  }

  /**
   * Inverts this value (1/value)
   */
  invert(): CSSNumericValue {
    if (this instanceof MockedCSSUnitValue && this.unit === 'number') {
      if (this.value === 0) {
        throw new RangeError('Cannot invert zero');
      }
      return new MockedCSSUnitValue(1 / this.value, 'number');
    }
    return new MockedCSSMathInvert(this);
  }

  /**
   * Checks if this value is equal to another
   */
  protected isEqualTo(other: MockedCSSNumericValue): boolean {
    if (this.constructor !== other.constructor) {
      return false;
    }
    
    if (this instanceof MockedCSSUnitValue && other instanceof MockedCSSUnitValue) {
      return this.value === other.value && this.unit === other.unit;
    }
    
    // For math values, check structure
    if (this instanceof MockedCSSMathSum && other instanceof MockedCSSMathSum) {
      return this.values.length === other.values.length &&
             this.values.every((v, i) => v.isEqualTo(other.values[i]));
    }
    
    // Add more comparisons for other math types as needed
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parse(_cssText: string): MockedCSSNumericValue {
    throw new TypeError('CSS.parse is not available in browsers');
  }
}

// ============================================================================
// CSSUnitValue
// ============================================================================

/**
 * Represents a CSS value with a single numeric value and unit
 */
class MockedCSSUnitValue extends MockedCSSNumericValue implements CSSUnitValue {
  constructor(public value: number, public unit: string) {
    super();
    
    // Validate numeric value - throw for NaN, Infinity, -Infinity
    if (typeof value !== 'number' || !isFinite(value)) {
      throw new TypeError('Invalid numeric value');
    }
    
    // Map % to percent
    if (unit === '%') {
      this.unit = 'percent';
    }
    
    // Validate unit
    if (this.unit !== 'number' && this.unit !== 'percent' && getBaseType(this.unit) === null) {
      throw new TypeError(`Invalid unit: ${unit}`);
    }
  }

  type(): CSSNumericType {
    return createTypeFromUnit(this.unit);
  }

  toString(): string {
    if (this.unit === 'number') {
      return String(this.value);
    }
    
    // Handle scientific notation for large numbers like browser
    if (Math.abs(this.value) >= 1000000) {
      const exp = this.value.toExponential();
      // Pad exponent with zero to match browser format (e+06 instead of e+6)
      const formatted = exp.replace(/e\+(\d)$/, 'e+0$1');
      return `${formatted}${this.unit}`;
    }
    
    return `${this.value}${this.unit}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parse(_cssText: string): MockedCSSUnitValue {
    // _cssText parameter required for interface compatibility
    throw new TypeError('CSS.parse is not available in browsers');
  }
}

// ============================================================================
// CSSMathValue (Base for Math Operations)
// ============================================================================

/**
 * Base class for CSS math expressions
 */
abstract class MockedCSSMathValue extends MockedCSSNumericValue implements CSSMathValue {
  abstract get operator(): CSSMathOperator;
  
  toString(): string {
    return `calc(${this.toCSSString()})`;
  }
  
  protected abstract toCSSString(): string;
}

// ============================================================================
// CSSMathSum
// ============================================================================

/**
 * Represents a CSS calc() sum expression
 */
class MockedCSSMathSum extends MockedCSSMathValue implements CSSMathSum {
  readonly operator: CSSMathOperator = 'sum';
  
  constructor(public values: MockedCSSNumericValue[]) {
    super();
    if (values.length === 0) {
      throw new SyntaxError('CSSMathSum requires at least one value');
    }
  }

  type(): CSSNumericType {
    let result = this.values[0].type();
    for (let i = 1; i < this.values.length; i++) {
      const addedType = addTypes(result, this.values[i].type());
      if (addedType === null) {
        throw new TypeError('Incompatible types in sum');
      }
      result = addedType;
    }
    return result;
  }

  protected toCSSString(): string {
    return this.values.map((v, i) => {
      const str = v.toString();
      if (i > 0) {
        if (str.startsWith('-')) {
          return `+ ${str}`;
        } else {
          return `+ ${str}`;
        }
      }
      return str;
    }).join(' ');
  }
}

// ============================================================================
// CSSMathProduct
// ============================================================================

/**
 * Represents a CSS calc() product expression
 */
class MockedCSSMathProduct extends MockedCSSMathValue implements CSSMathProduct {
  readonly operator: CSSMathOperator = 'product';
  
  constructor(public values: MockedCSSNumericValue[]) {
    super();
    if (values.length === 0) {
      throw new SyntaxError('CSSMathProduct requires at least one value');
    }
  }

  type(): CSSNumericType {
    let result = this.values[0].type();
    for (let i = 1; i < this.values.length; i++) {
      result = multiplyTypes(result, this.values[i].type());
    }
    return result;
  }

  protected toCSSString(): string {
    return this.values.map(v => v.toString()).join(' * ');
  }
}

// ============================================================================
// CSSMathNegate
// ============================================================================

/**
 * Represents a CSS calc() negation
 */
class MockedCSSMathNegate extends MockedCSSMathValue implements CSSMathNegate {
  readonly operator: CSSMathOperator = 'negate';
  
  constructor(public value: MockedCSSNumericValue) {
    super();
  }

  type(): CSSNumericType {
    return this.value.type();
  }

  protected toCSSString(): string {
    return `-${this.value.toString()}`;
  }
}

// ============================================================================
// CSSMathInvert
// ============================================================================

/**
 * Represents a CSS calc() inversion (1/value)
 */
class MockedCSSMathInvert extends MockedCSSMathValue implements CSSMathInvert {
  readonly operator: CSSMathOperator = 'invert';
  
  constructor(public value: MockedCSSNumericValue) {
    super();
  }

  type(): CSSNumericType {
    const valueType = this.value.type();
    const result: CSSNumericType = {
      length: -valueType.length,
      angle: -valueType.angle,
      time: -valueType.time,
      frequency: -valueType.frequency,
      resolution: -valueType.resolution,
      flex: -valueType.flex,
      percent: -valueType.percent
    };
    return result;
  }

  protected toCSSString(): string {
    return `1 / ${this.value.toString()}`;
  }
}

// ============================================================================
// CSSMathMin
// ============================================================================

/**
 * Represents a CSS min() expression
 */
class MockedCSSMathMin extends MockedCSSMathValue implements CSSMathMin {
  readonly operator: CSSMathOperator = 'min';
  
  constructor(public values: MockedCSSNumericValue[]) {
    super();
    if (values.length === 0) {
      throw new SyntaxError('CSSMathMin requires at least one value');
    }
  }

  type(): CSSNumericType {
    let result = this.values[0].type();
    for (let i = 1; i < this.values.length; i++) {
      const addedType = addTypes(result, this.values[i].type());
      if (addedType === null) {
        throw new TypeError('Incompatible types in min()');
      }
      result = addedType;
    }
    return result;
  }

  protected toCSSString(): string {
    return `min(${this.values.map(v => v.toString()).join(', ')})`;
  }

  toString(): string {
    return this.toCSSString();
  }
}

// ============================================================================
// CSSMathMax
// ============================================================================

/**
 * Represents a CSS max() expression
 */
class MockedCSSMathMax extends MockedCSSMathValue implements CSSMathMax {
  readonly operator: CSSMathOperator = 'max';
  
  constructor(public values: MockedCSSNumericValue[]) {
    super();
    if (values.length === 0) {
      throw new SyntaxError('CSSMathMax requires at least one value');
    }
  }

  type(): CSSNumericType {
    let result = this.values[0].type();
    for (let i = 1; i < this.values.length; i++) {
      const addedType = addTypes(result, this.values[i].type());
      if (addedType === null) {
        throw new TypeError('Incompatible types in max()');
      }
      result = addedType;
    }
    return result;
  }

  protected toCSSString(): string {
    return `max(${this.values.map(v => v.toString()).join(', ')})`;
  }

  toString(): string {
    return this.toCSSString();
  }
}

// ============================================================================
// CSSMathClamp
// ============================================================================

/**
 * Represents a CSS clamp() expression
 */
class MockedCSSMathClamp extends MockedCSSMathValue implements CSSMathClamp {
  readonly operator: CSSMathOperator = 'clamp';
  
  constructor(
    public lower: MockedCSSNumericValue,
    public value: MockedCSSNumericValue,
    public upper: MockedCSSNumericValue
  ) {
    super();
    
    // Type check compatibility
    const lowerType = lower.type();
    const valueType = value.type();
    const upperType = upper.type();
    
    const resultType = addTypes(lowerType, valueType);
    if (resultType === null) {
      throw new TypeError('Incompatible types in clamp() lower and value');
    }
    
    const finalType = addTypes(resultType, upperType);
    if (finalType === null) {
      throw new TypeError('Incompatible types in clamp()');
    }
  }

  type(): CSSNumericType {
    // All three values must be compatible, so return the type of any of them
    return this.lower.type();
  }

  protected toCSSString(): string {
    return `clamp(${this.lower.toString()}, ${this.value.toString()}, ${this.upper.toString()})`;
  }

  toString(): string {
    return this.toCSSString();
  }
}

// ============================================================================
// CSS Factory Functions
// ============================================================================

export const MockedCSS = {
  // Numbers and percentages
  number: (value: number) => new MockedCSSUnitValue(value, 'number'),
  percent: (value: number) => new MockedCSSUnitValue(value, 'percent'),
  
  // Length units - Absolute
  px: (value: number) => new MockedCSSUnitValue(value, 'px'),
  cm: (value: number) => new MockedCSSUnitValue(value, 'cm'),
  mm: (value: number) => new MockedCSSUnitValue(value, 'mm'),
  in: (value: number) => new MockedCSSUnitValue(value, 'in'),
  pt: (value: number) => new MockedCSSUnitValue(value, 'pt'),
  pc: (value: number) => new MockedCSSUnitValue(value, 'pc'),
  Q: (value: number) => new MockedCSSUnitValue(value, 'Q'),
  
  // Length units - Font-relative
  em: (value: number) => new MockedCSSUnitValue(value, 'em'),
  rem: (value: number) => new MockedCSSUnitValue(value, 'rem'),
  ex: (value: number) => new MockedCSSUnitValue(value, 'ex'),
  ch: (value: number) => new MockedCSSUnitValue(value, 'ch'),
  cap: (value: number) => new MockedCSSUnitValue(value, 'cap'),
  ic: (value: number) => new MockedCSSUnitValue(value, 'ic'),
  lh: (value: number) => new MockedCSSUnitValue(value, 'lh'),
  rlh: (value: number) => new MockedCSSUnitValue(value, 'rlh'),
  
  // Length units - Viewport-relative (original)
  vw: (value: number) => new MockedCSSUnitValue(value, 'vw'),
  vh: (value: number) => new MockedCSSUnitValue(value, 'vh'),
  vi: (value: number) => new MockedCSSUnitValue(value, 'vi'),
  vb: (value: number) => new MockedCSSUnitValue(value, 'vb'),
  vmin: (value: number) => new MockedCSSUnitValue(value, 'vmin'),
  vmax: (value: number) => new MockedCSSUnitValue(value, 'vmax'),
  
  // Length units - Viewport-relative (small)
  svw: (value: number) => new MockedCSSUnitValue(value, 'svw'),
  svh: (value: number) => new MockedCSSUnitValue(value, 'svh'),
  svi: (value: number) => new MockedCSSUnitValue(value, 'svi'),
  svb: (value: number) => new MockedCSSUnitValue(value, 'svb'),
  svmin: (value: number) => new MockedCSSUnitValue(value, 'svmin'),
  svmax: (value: number) => new MockedCSSUnitValue(value, 'svmax'),
  
  // Length units - Viewport-relative (large)
  lvw: (value: number) => new MockedCSSUnitValue(value, 'lvw'),
  lvh: (value: number) => new MockedCSSUnitValue(value, 'lvh'),
  lvi: (value: number) => new MockedCSSUnitValue(value, 'lvi'),
  lvb: (value: number) => new MockedCSSUnitValue(value, 'lvb'),
  lvmin: (value: number) => new MockedCSSUnitValue(value, 'lvmin'),
  lvmax: (value: number) => new MockedCSSUnitValue(value, 'lvmax'),
  
  // Length units - Viewport-relative (dynamic)
  dvw: (value: number) => new MockedCSSUnitValue(value, 'dvw'),
  dvh: (value: number) => new MockedCSSUnitValue(value, 'dvh'),
  dvi: (value: number) => new MockedCSSUnitValue(value, 'dvi'),
  dvb: (value: number) => new MockedCSSUnitValue(value, 'dvb'),
  dvmin: (value: number) => new MockedCSSUnitValue(value, 'dvmin'),
  dvmax: (value: number) => new MockedCSSUnitValue(value, 'dvmax'),
  
  // Length units - Container query
  cqw: (value: number) => new MockedCSSUnitValue(value, 'cqw'),
  cqh: (value: number) => new MockedCSSUnitValue(value, 'cqh'),
  cqi: (value: number) => new MockedCSSUnitValue(value, 'cqi'),
  cqb: (value: number) => new MockedCSSUnitValue(value, 'cqb'),
  cqmin: (value: number) => new MockedCSSUnitValue(value, 'cqmin'),
  cqmax: (value: number) => new MockedCSSUnitValue(value, 'cqmax'),
  
  // Angle units
  deg: (value: number) => new MockedCSSUnitValue(value, 'deg'),
  rad: (value: number) => new MockedCSSUnitValue(value, 'rad'),
  grad: (value: number) => new MockedCSSUnitValue(value, 'grad'),
  turn: (value: number) => new MockedCSSUnitValue(value, 'turn'),
  
  // Time units
  s: (value: number) => new MockedCSSUnitValue(value, 's'),
  ms: (value: number) => new MockedCSSUnitValue(value, 'ms'),
  
  // Frequency units
  Hz: (value: number) => new MockedCSSUnitValue(value, 'Hz'),
  kHz: (value: number) => new MockedCSSUnitValue(value, 'kHz'),
  
  // Resolution units
  dpi: (value: number) => new MockedCSSUnitValue(value, 'dpi'),
  dpcm: (value: number) => new MockedCSSUnitValue(value, 'dpcm'),
  dppx: (value: number) => new MockedCSSUnitValue(value, 'dppx'),
  
  // Flex units
  fr: (value: number) => new MockedCSSUnitValue(value, 'fr'),
};

// ============================================================================
// Initialization Function
// ============================================================================

/**
 * Initializes CSS Typed OM mocks in the global environment
 */
export function initCSSTypedOM(): void {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  // Install the classes on globalThis
  Object.defineProperty(globalThis, 'CSSNumericValue', {
    writable: true,
    configurable: true,
    value: MockedCSSNumericValue,
  });

  Object.defineProperty(globalThis, 'CSSUnitValue', {
    writable: true,
    configurable: true,
    value: MockedCSSUnitValue,
  });

  Object.defineProperty(globalThis, 'CSSMathValue', {
    writable: true,
    configurable: true,
    value: MockedCSSMathValue,
  });

  Object.defineProperty(globalThis, 'CSSMathSum', {
    writable: true,
    configurable: true,
    value: MockedCSSMathSum,
  });

  Object.defineProperty(globalThis, 'CSSMathProduct', {
    writable: true,
    configurable: true,
    value: MockedCSSMathProduct,
  });

  Object.defineProperty(globalThis, 'CSSMathNegate', {
    writable: true,
    configurable: true,
    value: MockedCSSMathNegate,
  });

  Object.defineProperty(globalThis, 'CSSMathInvert', {
    writable: true,
    configurable: true,
    value: MockedCSSMathInvert,
  });

  Object.defineProperty(globalThis, 'CSSMathMin', {
    writable: true,
    configurable: true,
    value: MockedCSSMathMin,
  });

  Object.defineProperty(globalThis, 'CSSMathMax', {
    writable: true,
    configurable: true,
    value: MockedCSSMathMax,
  });

  Object.defineProperty(globalThis, 'CSSMathClamp', {
    writable: true,
    configurable: true,
    value: MockedCSSMathClamp,
  });

  // Install CSS factory functions
  Object.defineProperty(globalThis, 'CSS', {
    writable: true,
    configurable: true,
    value: MockedCSS,
  });
}

// ============================================================================
// Exports
// ============================================================================

export {
  MockedCSSNumericValue,
  MockedCSSUnitValue,
  MockedCSSMathValue,
  MockedCSSMathSum,
  MockedCSSMathProduct,
  MockedCSSMathNegate,
  MockedCSSMathInvert,
  MockedCSSMathMin,
  MockedCSSMathMax,
  MockedCSSMathClamp,
};

// Re-export for compatibility with existing code
export { initCSSTypedOM as mockCSSTypedOM }; 