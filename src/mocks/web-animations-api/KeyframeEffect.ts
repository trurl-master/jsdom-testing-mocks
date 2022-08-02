import { mockAnimationEffect, MockedAnimationEffect } from './AnimationEffect';

/**
  Given the structure of PropertyIndexedKeyframes as such:
  {
    opacity: [ 0, 0.9, 1 ],
    transform: [ "translateX(0)", "translateX(50px)", "translateX(100px)" ],
    offset: [ 0, 0.8 ],
    easing: [ 'ease-in', 'ease-out' ],
  }
  convert it to the structure of Keyframe[] as such:
  [
    { opacity: 0, transform: "translateX(0)", offset: 0, easing: 'ease-in' },
    { opacity: 0.9, transform: "translateX(50px)", offset: 0.8, easing: 'ease-out' },
    { opacity: 1, transform: "translateX(100px)" },
  ]
*/
export function convertPropertyIndexedKeyframes(
  piKeyframes: PropertyIndexedKeyframes
): Keyframe[] {
  const keyframes: Keyframe[] = [];
  let done = false;
  let keyframeIndex = 0;

  while (!done) {
    let keyframe: Keyframe | undefined;

    for (const property in piKeyframes) {
      const values = piKeyframes[property];
      const propertyArray = Array.isArray(values) ? values : [values];

      if (!propertyArray) {
        continue;
      }

      const piKeyframe = propertyArray[keyframeIndex];

      if (typeof piKeyframe === 'undefined' || piKeyframe === null) {
        continue;
      }

      if (!keyframe) {
        keyframe = {};
      }

      keyframe[property] = piKeyframe;
    }

    if (keyframe) {
      keyframeIndex++;
      keyframes.push(keyframe);
      continue;
    }

    done = true;
  }

  return keyframes;
}

class MockedKeyframeEffect
  extends MockedAnimationEffect
  implements KeyframeEffect
{
  composite: CompositeOperation = 'replace';
  iterationComposite: IterationCompositeOperation;
  pseudoElement: string | null = null;
  target: Element | null;
  #keyframes: Keyframe[] = [];

  constructor(
    target: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options: number | KeyframeEffectOptions = {}
  ) {
    super();

    if (typeof options === 'number') {
      options = { duration: options };
    }

    const { composite, iterationComposite, pseudoElement, ...timing } = options;

    this.setKeyframes(keyframes);
    this.target = target;
    this.composite = composite || 'replace';
    // not actually implemented, just to make ts happy
    this.iterationComposite = iterationComposite || 'replace';
    this.pseudoElement = pseudoElement || null;
    this.updateTiming(timing);
  }

  #validateKeyframes(keyframes: Keyframe[]) {
    let lastExplicitOffset: number | undefined;

    keyframes.forEach((keyframe) => {
      const offset = keyframe.offset;

      if (typeof offset === 'number') {
        if (offset < 0 || offset > 1) {
          throw new TypeError(
            "Failed to construct 'KeyframeEffect': Offsets must be null or in the range [0,1]."
          );
        }

        if (typeof lastExplicitOffset === 'number') {
          if (offset < lastExplicitOffset) {
            throw new TypeError(
              "Failed to construct 'KeyframeEffect': Offsets must be monotonically non-decreasing."
            );
          }
        }

        lastExplicitOffset = offset;
      }
    });
  }

  getKeyframes(): ComputedKeyframe[] {
    const totalKeyframes = this.#keyframes.length;

    if (totalKeyframes === 0) {
      return [];
    }

    let currentOffset =
      this.#keyframes[0]?.offset ?? (totalKeyframes === 1 ? 1 : 0);

    return this.#keyframes.map(
      ({ composite, offset, easing, ...keyframe }, index) => {
        const computedKeyframe = {
          offset: offset ?? null,
          composite: composite ?? this.composite,
          easing: easing ?? 'linear',
          computedOffset: currentOffset,
          ...keyframe,
        };

        // calculate the next offset
        // (implements KeyframeEffect.spacing)
        let nextOffset: number | undefined;
        let keyframesUntilNextOffset: number | undefined;

        for (let i = index + 1; i < totalKeyframes; i++) {
          const offset = this.#keyframes[i].offset;

          if (typeof offset === 'number') {
            nextOffset = offset;
            keyframesUntilNextOffset = i - index;
            break;
          }
        }

        if (nextOffset === undefined) {
          nextOffset = 1;
          keyframesUntilNextOffset = this.#keyframes.length - index - 1;
        }

        const offsetDiff =
          typeof keyframesUntilNextOffset === 'number' &&
          keyframesUntilNextOffset > 0
            ? (nextOffset - currentOffset) / keyframesUntilNextOffset
            : 0;

        currentOffset = currentOffset + offsetDiff;

        return computedKeyframe;
      }
    );
  }

  setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null) {
    let kf: Keyframe[];

    if (keyframes === null) {
      kf = [];
    } else if (Array.isArray(keyframes)) {
      kf = keyframes;
    } else {
      kf = convertPropertyIndexedKeyframes(keyframes);
    }

    this.#validateKeyframes(kf);

    this.#keyframes = kf;
  }
}

function mockKeyframeEffect() {
  mockAnimationEffect();

  if (typeof KeyframeEffect === 'undefined') {
    Object.defineProperty(window, 'KeyframeEffect', {
      writable: true,
      configurable: true,
      value: MockedKeyframeEffect,
    });
  }
}

export { MockedKeyframeEffect, mockKeyframeEffect };
