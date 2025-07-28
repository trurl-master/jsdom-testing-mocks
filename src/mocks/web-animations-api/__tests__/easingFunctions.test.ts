import { StepsEasing } from '../easingFunctions';

// Test values from:
// https://codesandbox.io/s/staging-frog-hbtyhn?file=/index.html

describe('StepsEasing', () => {
  it('should throw error when invalid steps() function is provided', () => {
    expect(() => StepsEasing('steps(0.5, jump-end)')).toThrow(
      'Invalid easing function: steps(0.5, jump-end)'
    );
  });

  describe('jumpterms', () => {
    it('should return correct values for jump-start', () => {
      const easing1 = StepsEasing('steps(5, jump-start)');
      const easing2 = StepsEasing('steps(5, start)');

      function tests(easing: (value: number) => number) {
        expect(easing(0)).toBe(0);
        expect(easing(0.09158299999999997)).toBe(0.2);
        expect(easing(0.19157899999999994)).toBe(0.2);
        expect(easing(0.29990799999999984)).toBe(0.4);
        expect(easing(0.3999039999999998)).toBe(0.4);
        expect(easing(0.4998999999999998)).toBe(0.6);
        expect(easing(0.5998959999999998)).toBe(0.6);
        expect(easing(0.6998919999999997)).toBe(0.8);
        expect(easing(0.7998879999999997)).toBe(0.8);
        expect(easing(0.8998839999999997)).toBe(1);
        expect(easing(0.9915469999999997)).toBe(1);
        expect(easing(1)).toBe(1);
      }

      tests(easing1);
      tests(easing2);
    });

    it('should return correct values for jump-end', () => {
      const easing1 = StepsEasing('steps(5, jump-end)');
      const easing2 = StepsEasing('steps(5, end)');

      function tests(easing: (value: number) => number) {
        expect(easing(0)).toBe(0);
        expect(easing(0.00022300000000008424)).toBe(0);
        expect(easing(0.10021900000000006)).toBe(0);
        expect(easing(0.20021500000000003)).toBe(0.2);
        expect(easing(0.29187799999999964)).toBe(0.2);
        expect(easing(0.400207)).toBe(0.4);
        expect(easing(0.500203)).toBe(0.4);
        expect(easing(0.5918659999999996)).toBe(0.4);
        expect(easing(0.7001949999999999)).toBe(0.6);
        expect(easing(0.8001909999999999)).toBe(0.8);
        expect(easing(0.9001869999999998)).toBe(0.8);
        expect(easing(1)).toBe(1);
      }

      tests(easing1);
      tests(easing2);
    });

    it('should return correct values for jump-none', () => {
      const easing = StepsEasing('steps(5, jump-none)');

      expect(easing(0)).toBe(0);
      expect(easing(0.09995599999999993)).toBe(0);
      expect(easing(0.19161899999999998)).toBe(0);
      expect(easing(0.29161499999999996)).toBe(0.25);
      expect(easing(0.3999440000000001)).toBe(0.25);
      expect(easing(0.49994000000000005)).toBe(0.5);
      expect(easing(0.5916030000000001)).toBe(0.5);
      expect(easing(0.699932)).toBe(0.75);
      expect(easing(0.7999280000000002)).toBe(0.75);
      expect(easing(0.8999240000000002)).toBe(1);
      expect(easing(0.9999200000000001)).toBe(1);
      expect(easing(1)).toBe(1);
    });

    it('should return correct values for jump-both', () => {
      const easing = StepsEasing('steps(4, jump-both)');

      expect(easing(0)).toBe(0);
      expect(easing(0.09979599999999955)).toBe(0.2);
      expect(easing(0.19979199999999953)).toBe(0.2);
      expect(easing(0.2997879999999995)).toBe(0.4);
      expect(easing(0.3997839999999995)).toBe(0.4);
      expect(easing(0.49977999999999945)).toBe(0.4);
      expect(easing(0.5997759999999994)).toBe(0.6);
      expect(easing(0.6997719999999994)).toBe(0.6);
      expect(easing(0.7997679999999994)).toBe(0.8);
      expect(easing(0.8997639999999993)).toBe(0.8);
      expect(easing(0.9997600000000002)).toBe(0.8);
      expect(easing(1)).toBe(1);
    });

    it('should return correct values for step-start', () => {
      const easing = StepsEasing('step-start');

      expect(easing(0)).toBe(0);
      expect(easing(0.09979599999999955)).toBe(1);
      expect(easing(0.19979199999999953)).toBe(1);
      expect(easing(0.2997879999999995)).toBe(1);
      expect(easing(0.3997839999999995)).toBe(1);
      expect(easing(0.49977999999999945)).toBe(1);
      expect(easing(0.5997759999999994)).toBe(1);
      expect(easing(0.6997719999999994)).toBe(1);
      expect(easing(0.7997679999999994)).toBe(1);
      expect(easing(0.8997639999999993)).toBe(1);
      expect(easing(0.9997600000000002)).toBe(1);
      expect(easing(1)).toBe(1);
    });

    it('should return correct values for step-end', () => {
      const easing = StepsEasing('step-end');

      expect(easing(0)).toBe(0);
      expect(easing(0.09979599999999955)).toBe(0);
      expect(easing(0.19979199999999953)).toBe(0);
      expect(easing(0.2997879999999995)).toBe(0);
      expect(easing(0.3997839999999995)).toBe(0);
      expect(easing(0.49977999999999945)).toBe(0);
      expect(easing(0.5997759999999994)).toBe(0);
      expect(easing(0.6997719999999994)).toBe(0);
      expect(easing(0.7997679999999994)).toBe(0);
      expect(easing(0.8997639999999993)).toBe(0);
      expect(easing(0.9997600000000002)).toBe(0);
      expect(easing(1)).toBe(1);
    });
  });
});
