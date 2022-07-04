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

    // Calculated as (start_delay + active_duration + end_delay)
    const endTime =
      this.#timing.iterations === Infinity
        ? Infinity
        : (this.#timing.delay ?? 0) +
          activeDuration +
          (this.#timing.endDelay ?? 0);

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

if (typeof AnimationEffect === 'undefined') {
  Object.defineProperty(window, 'AnimationEffect', {
    writable: true,
    configurable: true,
    value: MockedAnimationEffect,
  });
}

export { MockedAnimationEffect };
