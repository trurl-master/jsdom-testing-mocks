import { cssNumberishToNumber } from '../cssNumberishHelpers';

// Mock CSSUnitValue for testing since it's not in the default JSDOM env
class MockCSSUnitValue {
  value: number;
  unit: string;
  constructor(value: number, unit: string) {
    this.value = value;
    this.unit = unit;
  }
}

// @ts-ignore
global.CSSUnitValue = MockCSSUnitValue;

describe('cssNumberishHelpers', () => {
  describe('cssNumberishToNumber', () => {
    it('should return null if the input is null', () => {
      expect(cssNumberishToNumber(null)).toBeNull();
    });

    it('should return the same number if the input is a number', () => {
      expect(cssNumberishToNumber(100)).toBe(100);
    });

    it('should convert seconds to milliseconds', () => {
      const twoSeconds = new CSSUnitValue(2, 's');
      expect(cssNumberishToNumber(twoSeconds)).toBe(2000);
    });

    it('should return the same value for milliseconds', () => {
      const twoHundredMs = new CSSUnitValue(200, 'ms');
      expect(cssNumberishToNumber(twoHundredMs)).toBe(200);
    });

    it('should return null for non-time units like px', () => {
      const oneHundredPx = new CSSUnitValue(100, 'px');
      expect(cssNumberishToNumber(oneHundredPx)).toBeNull();
    });

    it('should return null and warn for unsupported CSSMathValue', () => {
      // Mock CSSMathValue
      class MockCSSMathValue {}
      // @ts-ignore
      global.CSSMathValue = MockCSSMathValue;

      const consoleWarnSpy = runner.spyOn(console, 'warn').mockImplementation(() => {
        // This is a mock implementation to prevent console output during the test.
      });

      const mathValue = new MockCSSMathValue();
      // @ts-ignore
      expect(cssNumberishToNumber(mathValue)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'jsdom-testing-mocks: Complex CSSNumericValue (like calc()) are not supported. Returning null.'
      );

      consoleWarnSpy.mockRestore();
    });
  });
}); 