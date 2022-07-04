import {
  MockedKeyframeEffect,
  convertPropertyIndexedKeyframes,
} from './KeyframeEffect';

describe('KeyframeEffect', () => {
  it('should have correct properties by default', () => {
    const element = document.createElement('div');
    const ke = new KeyframeEffect(element, []);

    expect(ke).toBeInstanceOf(MockedKeyframeEffect);
    expect(ke.composite).toBe('replace');
    expect(ke.pseudoElement).toBeNull();
    expect(ke.target).toBe(element);
    expect(ke.getKeyframes()).toEqual([]);
    expect(ke.getTiming()).toEqual({
      delay: 0,
      direction: 'normal',
      duration: 'auto',
      easing: 'linear',
      endDelay: 0,
      fill: 'auto',
      iterationStart: 0,
      iterations: 1,
    });
    expect(ke.getComputedTiming()).toEqual({
      delay: 0,
      direction: 'normal',
      duration: 0,
      easing: 'linear',
      endDelay: 0,
      fill: 'none',
      iterationStart: 0,
      iterations: 1,
      activeDuration: 0,
      currentIteration: null,
      endTime: 0,
      localTime: null,
      progress: null,
    });
  });

  it('should calculate timing correctly', () => {
    const element = document.createElement('div');
    const ke = new KeyframeEffect(element, [], {
      delay: 100,
      duration: 3000,
      endDelay: 300,
      fill: 'forwards',
      iterations: 2,
    });

    expect(ke.getComputedTiming()).toEqual({
      activeDuration: 6000,
      currentIteration: null,
      delay: 100,
      direction: 'normal',
      duration: 3000,
      easing: 'linear',
      endDelay: 300,
      endTime: 6400,
      fill: 'forwards',
      iterationStart: 0,
      iterations: 2,
      localTime: null,
      progress: null,
    });
  });

  describe('converting keyframes from object to array', () => {
    it('should convert keyframes from object to array', () => {
      const testObjectKeyframes = {
        opacity: [0, 0.9, 1],
        transform: ['translateX(0)', 'translateX(50px)', 'translateX(100px)'],
        offset: [0, 0.8],
        easing: ['ease-in', 'ease-out'],
      };

      expect(convertPropertyIndexedKeyframes(testObjectKeyframes)).toEqual([
        {
          opacity: 0,
          transform: 'translateX(0)',
          offset: 0,
          easing: 'ease-in',
        },
        {
          opacity: 0.9,
          transform: 'translateX(50px)',
          offset: 0.8,
          easing: 'ease-out',
        },
        { opacity: 1, transform: 'translateX(100px)' },
      ]);
    });
  });

  it('throws an error if keyframe offset is not in the range [0,1]', () => {
    const element = document.createElement('div');
    const keyframes = [{ offset: -0.1, transform: 'translateX(0)' }];

    expect(() => {
      new KeyframeEffect(element, keyframes);
    }).toThrowError(
      "Failed to construct 'KeyframeEffect': Offsets must be null or in the range [0,1]."
    );
  });

  it('throws an error if offset are not monotonically non-decreasing', () => {
    const element = document.createElement('div');
    const keyframes = [
      { transform: 'translateX(0)', offset: 0.5 },
      { transform: 'translateX(50px)', offset: 0.4 },
    ];

    expect(() => {
      new KeyframeEffect(element, keyframes);
    }).toThrowError(
      "Failed to construct 'KeyframeEffect': Offsets must be monotonically non-decreasing."
    );
  });

  it('computes keyframes correctly, with default offset spacing', () => {
    const element = document.createElement('div');
    const ke = new KeyframeEffect(element, [
      { transform: 'translateX(0)', opacity: 0 },
      { transform: 'translateX(50px)', opacity: 1 },
      { transform: 'translateX(100px)', opacity: 0 },
      { transform: 'translateX(150px)', opacity: 1 },
      { transform: 'translateX(200px)', opacity: 0 },
    ]);

    expect(ke.getKeyframes()).toEqual([
      {
        offset: null,
        transform: 'translateX(0)',
        opacity: 0,
        easing: 'linear',
        composite: 'replace',
        computedOffset: 0,
      },
      {
        offset: null,
        transform: 'translateX(50px)',
        opacity: 1,
        easing: 'linear',
        composite: 'replace',
        computedOffset: 0.25,
      },
      {
        offset: null,
        transform: 'translateX(100px)',
        opacity: 0,
        easing: 'linear',
        composite: 'replace',
        computedOffset: 0.5,
      },
      {
        offset: null,
        transform: 'translateX(150px)',
        opacity: 1,
        easing: 'linear',
        composite: 'replace',
        computedOffset: 0.75,
      },
      {
        offset: null,
        transform: 'translateX(200px)',
        opacity: 0,
        easing: 'linear',
        composite: 'replace',
        computedOffset: 1,
      },
    ]);
  });

  describe('auto spacing', () => {
    it('auto spaces keyframes, when some offset is set, case 1', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [{ transform: 'translateX(0)' }]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });

    it('auto spaces keyframes, when some offset is set, case 2', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [
        { transform: 'translateX(0)', offset: 0.4 },
        { transform: 'translateX(50px)' },
      ]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 0.4 }),
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });

    it('auto spaces keyframes, when some offset is set, case 3', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [
        { transform: 'translateX(0)' },
        { transform: 'translateX(50px)', offset: 0 },
        { transform: 'translateX(100px)' },
        { transform: 'translateX(150px)' },
        { transform: 'translateX(200px)' },
      ]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 0 }),
        expect.objectContaining({ computedOffset: 0 }),
        expect.objectContaining({ computedOffset: 0.3333333333333333 }),
        expect.objectContaining({ computedOffset: 0.6666666666666667 }),
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });

    it('auto spaces keyframes, when some offset is set, case 4', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [
        { transform: 'translateX(0)' },
        { transform: 'translateX(50px)' },
        { transform: 'translateX(100px)' },
        { transform: 'translateX(150px)', offset: 1 },
        { transform: 'translateX(200px)' },
      ]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 0 }),
        expect.objectContaining({ computedOffset: 0.3333333333333333 }),
        expect.objectContaining({ computedOffset: 0.6666666666666667 }),
        expect.objectContaining({ computedOffset: 1 }),
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });

    it('auto spaces keyframes, when some offset is set, case 5', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [
        { transform: 'translateX(0)', offset: 0.5 },
        { transform: 'translateX(50px)' },
        { transform: 'translateX(100px)' },
        { transform: 'translateX(150px)' },
        { transform: 'translateX(200px)' },
      ]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 0.5 }),
        expect.objectContaining({ computedOffset: 0.625 }),
        expect.objectContaining({ computedOffset: 0.75 }),
        expect.objectContaining({ computedOffset: 0.875 }),
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });

    it('auto spaces keyframes, when some offset is set, case 6', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [
        { transform: 'translateX(0)' },
        { transform: 'translateX(50px)', offset: 0.5 },
        { transform: 'translateX(100px)' },
        { transform: 'translateX(150px)', offset: 0.5 },
        { transform: 'translateX(200px)' },
      ]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 0 }),
        expect.objectContaining({ computedOffset: 0.5 }),
        expect.objectContaining({ computedOffset: 0.5 }),
        expect.objectContaining({ computedOffset: 0.5 }),
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });

    it('auto spaces keyframes, when some offset is set, case 7', () => {
      const element = document.createElement('div');
      const ke = new KeyframeEffect(element, [
        { transform: 'translateX(0)' },
        { transform: 'translateX(50px)', offset: 0.2 },
        { transform: 'translateX(100px)' },
        { transform: 'translateX(150px)', offset: 0.9 },
        { transform: 'translateX(150px)' },
        { transform: 'translateX(200px)' },
      ]);

      expect(ke.getKeyframes()).toEqual([
        expect.objectContaining({ computedOffset: 0 }),
        expect.objectContaining({ computedOffset: 0.2 }),
        expect.objectContaining({ computedOffset: 0.55 }),
        expect.objectContaining({ computedOffset: 0.9 }),
        expect.objectContaining({ computedOffset: 0.95 }),
        expect.objectContaining({ computedOffset: 1 }),
      ]);
    });
  });
});
