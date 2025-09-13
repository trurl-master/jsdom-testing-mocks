import {
  cssNumberishToNumber,
  cssNumberishToNumberWithDefault,
  initCSSTypedOM,
} from '../cssNumberishHelpers';

describe('cssNumberishHelpers', () => {
  beforeAll(() => {
    // Set up the CSS Typed OM mocks
    initCSSTypedOM();
  });

  describe('cssNumberishToNumber', () => {
    it('should return null if the input is null', () => {
      expect(cssNumberishToNumber(null)).toBeNull();
    });

    it('should return the same number if the input is a number', () => {
      expect(cssNumberishToNumber(100)).toBe(100);
    });

    it('should handle number conversion for common use cases', () => {
      expect(cssNumberishToNumber(0)).toBe(0);
      expect(cssNumberishToNumber(42.5)).toBe(42.5);
      expect(cssNumberishToNumber(-10)).toBe(-10);
    });

    it('should convert seconds to milliseconds using CSSUnitValue', () => {
      const twoSeconds = new CSSUnitValue(2, 's');
      expect(cssNumberishToNumber(twoSeconds)).toBe(2000);
    });

    it('should return the same value for milliseconds using CSSUnitValue', () => {
      const twoHundredMs = new CSSUnitValue(200, 'ms');
      expect(cssNumberishToNumber(twoHundredMs)).toBe(200);
    });

    it('should return the same value for number unit using CSSUnitValue', () => {
      const numberValue = new CSSUnitValue(42, 'number');
      expect(cssNumberishToNumber(numberValue)).toBe(42);
    });

    it('should return null for non-time units like px', () => {
      const consoleWarnSpy = runner
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          /* do nothing */
        });
      const oneHundredPx = new CSSUnitValue(100, 'px');
      expect(cssNumberishToNumber(oneHundredPx)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "jsdom-testing-mocks: Unsupported CSS unit 'px' in cssNumberishToNumber. Returning null."
      );
      consoleWarnSpy.mockRestore();
    });

    it('should handle CSSMathValue for time calculations', () => {
      // Test time-dimensioned math values
      const timeSum = CSS.s(1).add(CSS.ms(500)); // 1.5 seconds = 1500ms
      expect(cssNumberishToNumber(timeSum)).toBe(1500);

      const timeProduct = CSS.s(2).mul(CSS.number(1.5)); // 3 seconds = 3000ms
      expect(cssNumberishToNumber(timeProduct)).toBe(3000);
    });

    it('should handle CSSMathValue for dimensionless calculations', () => {
      // Test dimensionless math values
      const numberSum = CSS.number(2).add(CSS.number(3)); // = 5
      expect(cssNumberishToNumber(numberSum)).toBe(5);

      const iterations = CSS.number(2.5).mul(CSS.number(2)); // = 5
      expect(cssNumberishToNumber(iterations)).toBe(5);
    });

    it('should return null and warn for incompatible CSSMathValue dimensions', () => {
      const consoleWarnSpy = runner
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          /* do nothing */
        });

      const lengthValue = CSS.px(100).add(CSS.em(1)); // Different length units create CSSMathSum
      expect(cssNumberishToNumber(lengthValue)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'jsdom-testing-mocks: CSSMathValue has incompatible dimensions for animation timing. Returning null.'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should return null and warn for unsupported values', () => {
      const consoleWarnSpy = runner
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          /* do nothing */
        });

      expect(cssNumberishToNumber({} as unknown as CSSNumberish)).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'jsdom-testing-mocks: Unsupported CSSNumberish value in cssNumberishToNumber. Returning null.'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('cssNumberishToNumberWithDefault', () => {
    it('should return the converted value if conversion succeeds', () => {
      expect(cssNumberishToNumberWithDefault(100, 50)).toBe(100);
      expect(
        cssNumberishToNumberWithDefault(new CSSUnitValue(2, 's'), 500)
      ).toBe(2000);
    });

    it('should return the default value if conversion fails', () => {
      expect(cssNumberishToNumberWithDefault(null, 50)).toBe(50);

      const consoleWarnSpy = runner
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          /* do nothing */
        });
      expect(
        cssNumberishToNumberWithDefault(new CSSUnitValue(100, 'px'), 42)
      ).toBe(42);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "jsdom-testing-mocks: Unsupported CSS unit 'px' in cssNumberishToNumber. Returning null."
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
