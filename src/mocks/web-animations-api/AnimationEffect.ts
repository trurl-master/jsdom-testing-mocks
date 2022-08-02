class MockedAnimationEffect implements AnimationEffect {
  #timing: EffectTiming = {
    delay: 0,
    direction: 'normal',
    duration: 'auto',
    easing: 'linear',
    endDelay: 0,
    fill: 'auto',
    iterationStart: 0,
    iterations: 1,
  };

  constructor() {
    if (this.constructor === MockedAnimationEffect) {
      throw new TypeError('Illegal constructor');
    }
  }

  #getNormalizedDuration(): number {
    // the only possible value is "auto"
    if (typeof this.#timing.duration === 'string') {
      return 0;
    }

    return this.#timing.duration ?? 0;
  }

  getTiming() {
    return this.#timing;
  }

  getComputedTiming(): ComputedEffectTiming {
    // duration of the animation
    const duration = this.#getNormalizedDuration();

    // Calculated as (iteration_duration * iteration_count)
    const activeDuration =
      this.#timing.iterations === Infinity
        ? Infinity
        : duration * (this.#timing.iterations ?? 1);

    // The end time of an animation effect is the result of evaluating max(start delay + active duration + end delay, 0).
    const endTime =
      this.#timing.iterations === Infinity
        ? Infinity
        : Math.max(
            (this.#timing.delay ?? 0) +
              activeDuration +
              (this.#timing.endDelay ?? 0),
            0
          );

    // must be linked to the animation
    const currentIteration = null;

    return {
      ...this.#timing,
      duration,
      fill: this.#timing.fill === 'auto' ? 'none' : this.#timing.fill,
      activeDuration,
      currentIteration:
        this.#timing.iterations === Infinity ? null : currentIteration,
      endTime,
      localTime: null,
      progress: null,
    };
  }

  updateTiming(timing?: OptionalEffectTiming | undefined): void {
    Object.assign(this.#timing, timing);
  }
}

function mockAnimationEffect() {
  if (typeof AnimationEffect === 'undefined') {
    Object.defineProperty(window, 'AnimationEffect', {
      writable: true,
      configurable: true,
      value: MockedAnimationEffect,
    });
  }
}

export { MockedAnimationEffect, mockAnimationEffect };
