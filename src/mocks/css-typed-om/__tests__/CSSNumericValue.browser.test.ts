import { describe, it, expect } from 'vitest';
import { MockedCSS, MockedCSSNumericValue, MockedCSSUnitValue } from '../index';

describe('CSS Typed OM Browser Compatibility', () => {
  describe('Abstract class behavior', () => {
    it('should not allow direct instantiation', () => {
      expect(() => {
        new CSSNumericValue();
      }).toThrow('Failed to construct \'CSSNumericValue\': Illegal constructor');
      
      expect(() => {
        // @ts-expect-error - CSSNumericValue is abstract
        new MockedCSSNumericValue();
      }).toThrow('Cannot instantiate abstract class MockedCSSNumericValue directly');
    });

    it('should require subclasses to implement toString', () => {
      const browserResult = CSS.px(10).toString();
      expect(typeof browserResult).toBe('string');
      
      const mockResult = MockedCSS.px(10).toString();
      expect(typeof mockResult).toBe('string');
    });
  });

  describe('Mathematical operations', () => {
    describe('add()', () => {
      it('should add CSSNumericValue instances and return CSSUnitValue', () => {
        const browserResult = CSS.px(10).add(CSS.px(20)).toString();
        expect(browserResult).toBe('30px');
        
        const mockResult = MockedCSS.px(10).add(MockedCSS.px(20)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should add multiple CSSNumericValue instances', () => {
        const browserResult = CSS.px(10).add(CSS.px(5), CSS.px(3)).toString();
        expect(browserResult).toBe('18px');
        
        const mockResult = MockedCSS.px(10).add(MockedCSS.px(5), MockedCSS.px(3)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should return the same value when no arguments provided', () => {
        const browserResult = CSS.px(10).add().toString();
        expect(browserResult).toBe('10px');
        
        const mockResult = MockedCSS.px(10).add().toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should handle mixed types and return CSSMathSum', () => {
        const browserResult = CSS.px(10).add(CSS.em(5)).toString();
        expect(browserResult).toBe('calc(10px + 5em)');
        
        const mockResult = MockedCSS.px(10).add(MockedCSS.em(5)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should throw error when adding numbers directly', () => {
        expect(() => CSS.px(10).add(5)).toThrow();
        
        expect(() => MockedCSS.px(10).add(5)).toThrow();
      });

      it('should work with CSS.number()', () => {
        expect(() => CSS.px(10).add(CSS.number(5))).toThrow();
        
        expect(() => MockedCSS.px(10).add(MockedCSS.number(5))).toThrow();
      });
    });

    describe('sub()', () => {
      it('should subtract CSSNumericValue instances and return CSSUnitValue', () => {
        const browserResult = CSS.px(10).sub(CSS.px(4)).toString();
        expect(browserResult).toBe('6px');
        
        const mockResult = MockedCSS.px(10).sub(MockedCSS.px(4)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should subtract multiple CSSNumericValue instances', () => {
        const browserResult = CSS.px(10).sub(CSS.px(2), CSS.px(1)).toString();
        expect(browserResult).toBe('7px');
        
        const mockResult = MockedCSS.px(10).sub(MockedCSS.px(2), MockedCSS.px(1)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should return the same value when no arguments provided', () => {
        const browserResult = CSS.px(10).sub().toString();
        expect(browserResult).toBe('10px');
        
        const mockResult = MockedCSS.px(10).sub().toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should handle mixed types and return CSSMathSum', () => {
        const browserResult = CSS.px(10).sub(CSS.em(2)).toString();
        expect(browserResult).toBe('calc(10px + -2em)');
        
        const mockResult = MockedCSS.px(10).sub(MockedCSS.em(2)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should throw error when subtracting numbers directly', () => {
        expect(() => CSS.px(10).sub(5)).toThrow();
        
        expect(() => MockedCSS.px(10).sub(5)).toThrow();
      });

      it('should work with CSS.number()', () => {
        expect(() => CSS.px(10).sub(CSS.number(5))).toThrow();
        
        expect(() => MockedCSS.px(10).sub(MockedCSS.number(5))).toThrow();
      });
    });

    describe('mul()', () => {
      it('should multiply with numbers and return CSSUnitValue', () => {
        const browserResult = CSS.px(10).mul(CSS.number(2)).toString();
        expect(browserResult).toBe('20px');
        
        const mockResult = MockedCSS.px(10).mul(MockedCSS.number(2)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should multiply with multiple numbers', () => {
        const browserResult = CSS.px(10).mul(CSS.number(2), CSS.number(3)).toString();
        expect(browserResult).toBe('60px');
        
        const mockResult = MockedCSS.px(10).mul(MockedCSS.number(2), MockedCSS.number(3)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should multiply with numbers directly', () => {
        const browserResult = CSS.px(10).mul(2).toString();
        expect(browserResult).toBe('20px');
        
        const mockResult = MockedCSS.px(10).mul(2).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should work with CSS.number()', () => {
        const browserResult = CSS.px(10).mul(CSS.number(2)).toString();
        expect(browserResult).toBe('20px');
        
        const mockResult = MockedCSS.px(10).mul(MockedCSS.number(2)).toString();
        expect(mockResult).toBe(browserResult);
      });
    });

    describe('div()', () => {
      it('should divide with numbers and return CSSUnitValue', () => {
        const browserResult = CSS.px(10).div(CSS.number(2)).toString();
        expect(browserResult).toBe('5px');
        
        const mockResult = MockedCSS.px(10).div(MockedCSS.number(2)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should divide with multiple numbers', () => {
        const browserResult = CSS.px(10).div(CSS.number(2), CSS.number(5)).toString();
        expect(browserResult).toBe('1px');
        
        const mockResult = MockedCSS.px(10).div(MockedCSS.number(2), MockedCSS.number(5)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should divide with numbers directly', () => {
        const browserResult = CSS.px(10).div(2).toString();
        expect(browserResult).toBe('5px');
        
        const mockResult = MockedCSS.px(10).div(2).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should work with CSS.number()', () => {
        const browserResult = CSS.px(10).div(CSS.number(2)).toString();
        expect(browserResult).toBe('5px');
        
        const mockResult = MockedCSS.px(10).div(MockedCSS.number(2)).toString();
        expect(mockResult).toBe(browserResult);
      });

      it('should throw RangeError when dividing by zero', () => {
        expect(() => CSS.px(10).div(CSS.number(0))).toThrow(RangeError);
        
        expect(() => MockedCSS.px(10).div(MockedCSS.number(0))).toThrow(RangeError);
      });
    });

    describe('min()', () => {
      it('should handle raw numbers differently between browser and mock', () => {
        // IMPORTANT: Browser vs Mock behavior difference
        // 
        // Browser behavior: Returns null for raw numbers (implementation quirk)
        // Mock behavior: Throws TypeError per CSS Typed OM specification
        // 
        // The CSS Typed OM spec (https://www.w3.org/TR/css-typed-om-1/#dom-cssnumericvalue-min)
        // clearly states that min() should throw a TypeError when given incompatible values.
        // However, current browser implementations return null instead of throwing.
        // 
        // Our mock follows the specification for better type safety and predictable behavior,
        // while acknowledging that real browsers have this quirky implementation.
        
        const browserResult = CSS.px(10).min(5);
        expect(browserResult).toBe(null);
        
        expect(() => MockedCSS.px(10).min(5)).toThrow(TypeError);
      });

      it('should work with CSSNumericValue instances', () => {
        const browserResult = CSS.px(10).min(CSS.px(5)).toString();
        expect(browserResult).toBe('5px');
        
        const mockResult = MockedCSS.px(10).min(MockedCSS.px(5)).toString();
        expect(mockResult).toBe(browserResult);
      });
    });

    describe('max()', () => {
      it('should handle raw numbers differently between browser and mock', () => {
        // IMPORTANT: Browser vs Mock behavior difference
        // 
        // Browser behavior: Returns null for raw numbers (implementation quirk)
        // Mock behavior: Throws TypeError per CSS Typed OM specification
        // 
        // The CSS Typed OM spec (https://www.w3.org/TR/css-typed-om-1/#dom-cssnumericvalue-max)
        // clearly states that max() should throw a TypeError when given incompatible values.
        // However, current browser implementations return null instead of throwing.
        // 
        // Our mock follows the specification for better type safety and predictable behavior,
        // while acknowledging that real browsers have this quirky implementation.
        
        const browserResult = CSS.px(10).max(15);
        expect(browserResult).toBe(null);
        
        expect(() => MockedCSS.px(10).max(15)).toThrow(TypeError);
      });

      it('should work with CSSNumericValue instances', () => {
        const browserResult = CSS.px(10).max(CSS.px(15)).toString();
        expect(browserResult).toBe('15px');
        
        const mockResult = MockedCSS.px(10).max(MockedCSS.px(15)).toString();
        expect(mockResult).toBe(browserResult);
      });
    });
  });

  describe('Comparison operations', () => {
    it('should return true for identical values', () => {
      const browserValue1 = CSS.px(10);
      const browserValue2 = CSS.px(10);
      const browserResult = browserValue1.equals(browserValue2);
      expect(browserResult).toBe(true);
      
      const mockValue1 = MockedCSS.px(10);
      const mockValue2 = MockedCSS.px(10);
      const mockResult = mockValue1.equals(mockValue2);
      expect(mockResult).toBe(browserResult);
    });

    it('should return false for different values', () => {
      const browserValue1 = CSS.px(10);
      const browserValue2 = CSS.px(15);
      const browserResult = browserValue1.equals(browserValue2);
      expect(browserResult).toBe(false);
      
      const mockValue1 = MockedCSS.px(10);
      const mockValue2 = MockedCSS.px(15);
      const mockResult = mockValue1.equals(mockValue2);
      expect(mockResult).toBe(browserResult);
    });

    it('should return false for different units', () => {
      const browserValue1 = CSS.px(10);
      const browserValue2 = CSS.em(10);
      const browserResult = browserValue1.equals(browserValue2);
      expect(browserResult).toBe(false);
      
      const mockValue1 = MockedCSS.px(10);
      const mockValue2 = MockedCSS.em(10);
      const mockResult = mockValue1.equals(mockValue2);
      expect(mockResult).toBe(browserResult);
    });
  });

  describe('Unit conversion', () => {
    it('should convert compatible units', () => {
      const browserResult = CSS.px(96).to('in').toString();
      expect(browserResult).toBe('1in');
      
      const mockResult = MockedCSS.px(96).to('in').toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should return same value for same unit', () => {
      const browserResult = CSS.px(10).to('px').toString();
      expect(browserResult).toBe('10px');
      
      const mockResult = MockedCSS.px(10).to('px').toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should throw TypeError for incompatible units', () => {
      expect(() => CSS.px(10).to('s')).toThrow();
      
      expect(() => MockedCSS.px(10).to('s')).toThrow();
    });
  });

  describe('toSum() operations', () => {
    it('should convert to sum with compatible units', () => {
      const browserResult = CSS.px(10).toSum('px', 'em').toString();
      expect(browserResult).toBe('calc(10px + 0em)');
      
      const mockResult = MockedCSS.px(10).toSum('px', 'em').toString();
      expect(mockResult).toBe(browserResult);
    });
  });

  describe('Type information', () => {
    it('should return type for length units', () => {
      const browserType = CSS.px(10).type();
      expect(browserType).toEqual({ length: 1 });
      
      const mockType = MockedCSS.px(10).type();
      expect(mockType).toEqual(browserType);
    });

    it('should return type for time units', () => {
      const browserType = CSS.s(10).type();
      expect(browserType).toEqual({ time: 1 });
      
      const mockType = MockedCSS.s(10).type();
      expect(mockType).toEqual(browserType);
    });

    it('should return type for angle units', () => {
      const browserType = CSS.deg(10).type();
      expect(browserType).toEqual({ angle: 1 });
      
      const mockType = MockedCSS.deg(10).type();
      expect(mockType).toEqual(browserType);
    });

    it('should return empty object for dimensionless numbers', () => {
      const browserType = CSS.number(10).type();
      expect(browserType).toEqual({});
      
      const mockType = MockedCSS.number(10).type();
      expect(mockType).toEqual(browserType);
    });

    it('should return type for percent units', () => {
      const browserType = CSS.percent(10).type();
      expect(browserType).toEqual({ percent: 1 });
      
      const mockType = MockedCSS.percent(10).type();
      expect(mockType).toEqual(browserType);
    });

    it('should return type for flex units', () => {
      const browserType = CSS.fr(10).type();
      expect(browserType).toEqual({ flex: 1 });
      
      const mockType = MockedCSS.fr(10).type();
      expect(mockType).toEqual(browserType);
    });
  });

  describe('Complex expressions and edge cases', () => {
    it('should handle zero values correctly', () => {
      const browserResult = CSS.px(0).add(CSS.px(5)).toString();
      expect(browserResult).toBe('5px');
      
      const mockResult = MockedCSS.px(0).add(MockedCSS.px(5)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle negative values correctly', () => {
      const browserResult = CSS.px(-10).add(CSS.px(15)).toString();
      expect(browserResult).toBe('5px');
      
      const mockResult = MockedCSS.px(-10).add(MockedCSS.px(15)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle very large numbers', () => {
      const browserResult = CSS.px(1e6).mul(CSS.number(2)).toString();
      expect(browserResult).toBe('2e+06px');
      
      const mockResult = MockedCSS.px(1e6).mul(MockedCSS.number(2)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle very small numbers', () => {
      const browserResult = CSS.px(1e-6).mul(CSS.number(1000)).toString();
      expect(browserResult).toBe('0.001px');
      
      const mockResult = MockedCSS.px(1e-6).mul(MockedCSS.number(1000)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle NaN values', () => {
      expect(() => CSS.px(NaN)).toThrow();
      
      expect(() => MockedCSS.px(NaN)).toThrow();
    });

    it('should handle Infinity values', () => {
      expect(() => CSS.px(Infinity)).toThrow();
      
      expect(() => MockedCSS.px(Infinity)).toThrow();
    });

    it('should handle -Infinity values', () => {
      expect(() => CSS.px(-Infinity)).toThrow();
      
      expect(() => MockedCSS.px(-Infinity)).toThrow();
    });
  });

  describe('Combined operations with multiple functions', () => {
    it('should handle basic chained operations', () => {
      const browserResult = CSS.px(10).add(CSS.px(5)).sub(CSS.px(2)).toString();
      expect(browserResult).toBe('13px');
      
      const mockResult = MockedCSS.px(10).add(MockedCSS.px(5)).sub(MockedCSS.px(2)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle multiplication with numbers', () => {
      const browserResult = CSS.px(10).mul(CSS.number(3)).toString();
      expect(browserResult).toBe('30px');
      
      const mockResult = MockedCSS.px(10).mul(MockedCSS.number(3)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle division with numbers', () => {
      const browserResult = CSS.px(10).div(CSS.number(2)).toString();
      expect(browserResult).toBe('5px');
      
      const mockResult = MockedCSS.px(10).div(MockedCSS.number(2)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle unit conversion', () => {
      const browserResult = CSS.px(96).to('in').toString();
      expect(browserResult).toBe('1in');
      
      const mockResult = MockedCSS.px(96).to('in').toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle toSum with compatible units', () => {
      const browserResult = CSS.px(10).add(CSS.px(5)).toSum('px').toString();
      expect(browserResult).toBe('calc(15px)');
      
      const mockResult = MockedCSS.px(10).add(MockedCSS.px(5)).toSum('px').toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should handle toSum with multiple units', () => {
      const browserResult = CSS.px(10).add(CSS.cm(1)).toSum('px', 'cm').toString();
      expect(browserResult).toBe('calc(47.7953px + 0cm)');
      
      const mockResult = MockedCSS.px(10).add(MockedCSS.cm(1)).toSum('px', 'cm').toString();
      expect(mockResult).toBe(browserResult);
    });
  });

  describe('Mathematical properties', () => {
    it('should handle commutative property of addition', () => {
      const a = CSS.px(10);
      const b = CSS.px(5);
      const browserResult1 = a.add(b);
      const browserResult2 = b.add(a);
      expect(browserResult1.equals(browserResult2)).toBe(true);
      
      const mockA = MockedCSS.px(10);
      const mockB = MockedCSS.px(5);
      const mockResult1 = mockA.add(mockB);
      const mockResult2 = mockB.add(mockA);
      expect(mockResult1.equals(mockResult2)).toBe(true);
    });

    it('should handle associative property of addition', () => {
      const a = CSS.px(10);
      const b = CSS.px(5);
      const c = CSS.px(3);
      const browserResult1 = a.add(b).add(c);
      const browserResult2 = a.add(b.add(c));
      expect(browserResult1.equals(browserResult2)).toBe(true);
      
      const mockA = MockedCSS.px(10);
      const mockB = MockedCSS.px(5);
      const mockC = MockedCSS.px(3);
      const mockResult1 = mockA.add(mockB).add(mockC);
      const mockResult2 = mockA.add(mockB.add(mockC));
      expect(mockResult1.equals(mockResult2)).toBe(true);
    });

    it('should handle distributive property', () => {
      const a = CSS.px(10);
      const b = CSS.px(5);
      const c = CSS.number(2);
      const browserResult1 = a.add(b).mul(c);
      const browserResult2 = a.mul(c).add(b.mul(c));
      expect(browserResult1.equals(browserResult2)).toBe(true);
      
      const mockA = MockedCSS.px(10);
      const mockB = MockedCSS.px(5);
      const mockC = MockedCSS.number(2);
      const mockResult1 = mockA.add(mockB).mul(mockC);
      const mockResult2 = mockA.mul(mockC).add(mockB.mul(mockC));
      expect(mockResult1.equals(mockResult2)).toBe(true);
    });

    it('should handle identity property of multiplication', () => {
      const a = CSS.px(10);
      const browserResult = a.mul(CSS.number(1));
      expect(a.equals(browserResult)).toBe(true);
      
      const mockA = MockedCSS.px(10);
      const mockResult = mockA.mul(MockedCSS.number(1));
      expect(mockA.equals(mockResult)).toBe(true);
    });

    it('should handle zero property of multiplication', () => {
      const a = CSS.px(10);
      const browserResult = a.mul(CSS.number(0));
      expect((browserResult as CSSUnitValue).value).toBe(0);
      
      const mockA = MockedCSS.px(10);
      const mockResult = mockA.mul(MockedCSS.number(0));
      expect((mockResult as MockedCSSUnitValue).value).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should throw TypeError for invalid unit types', () => {
      expect(() => new MockedCSSUnitValue(10, 'invalid')).toThrow(TypeError);
    });

    it('should handle invalid numeric values gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => CSS.px('invalid' as any)).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => MockedCSS.px('invalid' as any)).toThrow();
    });

    it('should throw RangeError for division by zero', () => {
      expect(() => CSS.px(10).div(CSS.number(0))).toThrow(RangeError);
      expect(() => MockedCSS.px(10).div(MockedCSS.number(0))).toThrow(RangeError);
    });

    it('should throw TypeError for incompatible unit conversions', () => {
      expect(() => CSS.px(10).to('s')).toThrow(TypeError);
      expect(() => MockedCSS.px(10).to('s')).toThrow(TypeError);
    });
  });

  describe('Browser compatibility tests', () => {
    it('should match browser behavior for basic px creation', () => {
      const browserResult = CSS.px(10).toString();
      expect(browserResult).toBe('10px');
      
      const mockResult = MockedCSS.px(10).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should match browser behavior for basic addition', () => {
      const browserResult = CSS.px(10).add(CSS.px(5)).toString();
      expect(browserResult).toBe('15px');
      
      const mockResult = MockedCSS.px(10).add(MockedCSS.px(5)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should match browser behavior for basic subtraction', () => {
      const browserResult = CSS.px(10).sub(CSS.px(3)).toString();
      expect(browserResult).toBe('7px');
      
      const mockResult = MockedCSS.px(10).sub(MockedCSS.px(3)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should match browser behavior for multiplication', () => {
      const browserResult = CSS.px(10).mul(CSS.number(2)).toString();
      expect(browserResult).toBe('20px');
      
      const mockResult = MockedCSS.px(10).mul(MockedCSS.number(2)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should match browser behavior for division', () => {
      const browserResult = CSS.px(10).div(CSS.number(2)).toString();
      expect(browserResult).toBe('5px');
      
      const mockResult = MockedCSS.px(10).div(MockedCSS.number(2)).toString();
      expect(mockResult).toBe(browserResult);
    });

    it('should match browser behavior for unit conversion', () => {
      const browserResult = CSS.px(96).to('in').toString();
      expect(browserResult).toBe('1in');
      
      const mockResult = MockedCSS.px(96).to('in').toString();
      expect(mockResult).toBe(browserResult);
    });
  });
}); 