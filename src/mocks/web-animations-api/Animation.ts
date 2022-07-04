import './AnimationEffect';
import './KeyframeEffect';
import './AnimationPlaybackEvent';
import './AnimationTimeline';

type ComputedKeyframeNonStylePropNames =
  | 'composite'
  | 'computedOffset'
  | 'easing'
  | 'offset';

type ComputedKeyframeStyleProps = Omit<
  ComputedKeyframe,
  ComputedKeyframeNonStylePropNames
>;

type ComputedKeyframeWithOptionalNonStyleProps = ComputedKeyframeStyleProps &
  Partial<Pick<ComputedKeyframe, ComputedKeyframeNonStylePropNames>>;

class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateError';
  }
}

export const NON_STYLE_KEYFRAME_PROPERTIES = ['offset', 'composite', 'easing'];
export const RENAMED_KEYFRAME_PROPERTIES: {
  [key: string]: string;
} = {
  cssFloat: 'float',
  cssOffset: 'offset',
};

let durationMultiplier = 1;

function setDurationMultiplier(multiplier: number) {
  durationMultiplier = multiplier;
}

class MockedAnimation extends EventTarget implements Animation {
  // effect: AnimationEffect | null = null;
  finished: Promise<Animation>;
  id = '';
  readonly pending = false;
  playState: AnimationPlayState = 'idle';
  playbackRate = 1;
  readonly ready = Promise.resolve(this);
  readonly replaceState = 'active';
  startTime: CSSNumberish | null = null;
  timeline: AnimationTimeline | null;

  // implementation details
  #effect: AnimationEffect | null = null;
  #initialKeyframe: ComputedKeyframeStyleProps;
  #fillMode: Omit<FillMode, 'auto'>;
  #resolve: ((value: Animation | PromiseLike<Animation>) => void) | null = null;
  #reject: ((reason: Error) => void) | null = null;
  #timeout: NodeJS.Timeout | null = null;
  #pauseTime: number | null = null;
  #pausedTime = {
    delay: 0,
    active: 0,
    endDelay: 0,
  };
  #phase: 'delay' | 'active' | 'endDelay' = 'delay';

  constructor(
    effect: AnimationEffect | null = null,
    timeline: AnimationTimeline = new AnimationTimeline()
  ) {
    super();

    this.#effect = effect;
    this.timeline = timeline;
    this.#initialKeyframe = this.#calcInitialKeyframe();
    this.#fillMode = effect?.getComputedTiming().fill ?? 'none';

    if (effect) {
      const originalGetComputedTiming = effect.getComputedTiming;

      effect.getComputedTiming = () => {
        const computedTiming = originalGetComputedTiming.call(effect);
        const computedDelay = computedTiming.delay ?? 0;
        const localTime = this.currentTime;

        return {
          ...computedTiming,
          localTime,
          progress:
            // diration should always be a number here, there's an error with types (i think)
            this.currentTime && typeof computedTiming.duration === 'number'
              ? ((this.currentTime - computedDelay) / computedTiming.duration) %
                1
              : null,
        };
      };

      if (effect.getComputedTiming().delay === 0) {
        this.#phase = 'active';
      }
    }

    this.finished = this.#getNewFinished();
  }

  #getNewFinished() {
    return new Promise<Animation>((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }

  #clearTimeout() {
    if (this.#timeout) {
      clearTimeout(this.#timeout as NodeJS.Timeout);
      this.#timeout = null;
    }
  }

  #calcInitialKeyframe() {
    const initialKeyframe: ComputedKeyframeStyleProps = {};
    const uniqueProps = new Set<string>();

    if (!(this.#effect instanceof KeyframeEffect)) {
      return initialKeyframe;
    }

    const target = this.#effect.target;

    this.#effect.getKeyframes().forEach((keyframe) => {
      for (const property in keyframe) {
        if (NON_STYLE_KEYFRAME_PROPERTIES.includes(property)) {
          continue;
        }

        uniqueProps.add(property);
      }
    });

    uniqueProps.forEach((property) => {
      const propertyName = RENAMED_KEYFRAME_PROPERTIES[property] ?? property;

      const value = (target as HTMLElement).style.getPropertyValue(
        propertyName
      );

      initialKeyframe[property] = value;
    });

    return initialKeyframe;
  }

  #flushPausedTime() {
    if (this.playState !== 'paused' || this.#pauseTime === null) {
      return;
    }

    const now = performance.now();
    const timeDiff = now - this.#pauseTime;

    switch (this.#phase) {
      case 'delay':
        this.#pausedTime.delay += timeDiff;
        break;
      case 'active':
        this.#pausedTime.active += timeDiff;
        break;
      case 'endDelay':
        this.#pausedTime.endDelay += timeDiff;
        break;
    }

    this.#pauseTime = now;
  }

  get effect() {
    return this.#effect;
  }

  set effect(effect: AnimationEffect | null) {
    const oldEffect = this.#effect;
    this.#effect = effect;

    if (oldEffect && !effect) {
      console.log(
        'DeveloperSuckError: Removing the effect is not implemented yet'
      );
      return;
    }
  }

  get currentTime(): CSSNumberish | null {
    this.#flushPausedTime();

    const totalPausedTime =
      this.#pausedTime.delay +
      this.#pausedTime.active +
      this.#pausedTime.endDelay;

    return this.startTime
      ? (performance.now() - (this.startTime as number) - totalPausedTime) /
          durationMultiplier
      : null;
  }

  set currentTime(time: number | null) {
    if (
      this.playState !== 'idle' &&
      this.currentTime !== null &&
      time === null
    ) {
      throw new Error(
        "Failed to set the 'currentTime' property on 'Animation': currentTime may not be changed from resolved to unresolved"
      );
    }

    // this.clearTimeout();

    // this.playState = "idle";
    // this.startTime = null;

    // this.play();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null =
    null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null =
    null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onremove: ((this: Animation, ev: Event) => any) | null = null;

  cancel() {
    if (this.playState === 'idle') {
      return;
    }

    this.playState = 'idle';
    this.startTime = null;
    this.#pauseTime = null;
    this.#pausedTime = {
      delay: 0,
      active: 0,
      endDelay: 0,
    };
    this.#phase = 'delay';

    const cancelEvent = new AnimationPlaybackEvent('cancel');

    this.#clearTimeout();
    this.oncancel?.call(this, cancelEvent);
    this.dispatchEvent(cancelEvent);
    this.#reject?.(new Error('DOMException: The user aborted a request.'));
    this.finished = this.#getNewFinished();
  }

  #commitKeyframeStyles(keyframe: ComputedKeyframeWithOptionalNonStyleProps) {
    if (!(this.#effect instanceof KeyframeEffect)) {
      return;
    }

    const element = this.#effect.target as HTMLElement;
    const { composite, computedOffset, easing, offset, ...keyframeStyles } =
      keyframe;

    for (const property in keyframeStyles) {
      const value = keyframeStyles[property];

      if (typeof value === 'undefined' || value === null) {
        element.style.removeProperty(property);
        continue;
      }

      const valueAsString =
        typeof value === 'string' ? value : value.toString();

      element.style.setProperty(property, valueAsString);
    }
  }

  // this mock doesn't calculate intermediate styles,
  // only the ones defined in keyframes
  commitStyles() {
    if (!(this.#effect instanceof KeyframeEffect)) {
      return;
    }

    const keyframes = this.#effect.getKeyframes();
    const currentProgress = this.#effect.getComputedTiming().progress;

    if (keyframes.length === 0 || !currentProgress || !this.#effect.target) {
      return;
    }

    // find the keyframe closest to the current progress
    let closestKeyframe: ComputedKeyframe = keyframes[0];
    let smallestDistance = Infinity;

    for (const keyframe of keyframes) {
      const distance = Math.abs(keyframe.computedOffset - currentProgress);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestKeyframe = keyframe;
      }
    }

    this.#commitKeyframeStyles(closestKeyframe);
  }

  #finish() {
    const finishEvent = new AnimationPlaybackEvent('finish');
    this.onfinish?.call(this, finishEvent);
    this.dispatchEvent(finishEvent);
    this.playState = 'finished';
    this.#resolve?.(this);
  }

  finish() {
    if (!(this.#effect instanceof KeyframeEffect)) {
      return;
    }

    if (this.#effect?.getComputedTiming().iterations === Infinity) {
      throw new InvalidStateError(
        "Failed to execute 'finish' on 'Animation': Cannot finish Animation with an infinite target effect end."
      );
    }

    const computedEndDelay =
      (this.#effect?.getComputedTiming().endDelay ?? 0) -
      this.#pausedTime.endDelay;

    if (computedEndDelay > 0) {
      switch (this.#fillMode) {
        case 'none':
        case 'backwards':
          this.#commitKeyframeStyles(this.#initialKeyframe);
          break;
        case 'forwards':
        case 'both':
          {
            const keyframes = this.#effect.getKeyframes();
            this.#commitKeyframeStyles(keyframes[keyframes.length - 1]);
          }
          break;
      }

      this.#timeout = setTimeout(
        () => this.#finish(),
        computedEndDelay * durationMultiplier
      );
      this.#phase = 'endDelay';
    } else {
      this.#finish();
    }
  }

  pause() {
    this.playState = 'paused';
    this.#clearTimeout();
    this.#pauseTime = performance.now();
  }

  persist() {
    console.log("persist isn't implemented yet");
  }

  #resume() {
    if (!(this.#effect instanceof KeyframeEffect)) {
      return;
    }

    const computedDuration =
      this.#effect.getComputedTiming().activeDuration ?? 0;
    const duration = computedDuration - this.#pausedTime.active;

    switch (this.#phase) {
      case 'delay':
        {
          const computedDelay = this.#effect.getComputedTiming().delay ?? 0;
          this.#timeout = setTimeout(() => {
            this.#timeout = setTimeout(
              () => this.finish(),
              duration * this.playbackRate * durationMultiplier
            );
            this.#phase = 'active';
          }, (computedDelay - this.#pausedTime.delay) * durationMultiplier);
        }
        break;
      case 'active':
        this.#timeout = setTimeout(
          () => this.finish(),
          duration * this.playbackRate * durationMultiplier
        );
        break;
      case 'endDelay':
        this.finish();
        break;
    }
    this.#pauseTime = null;
  }

  play() {
    if (!(this.#effect instanceof KeyframeEffect)) {
      return;
    }

    switch (this.playState) {
      case 'idle':
        if (this.#fillMode === 'backwards' || this.#fillMode === 'both') {
          const keyframes = this.#effect.getKeyframes();
          if (keyframes.length > 1) {
            this.#commitKeyframeStyles(keyframes[0]);
          }
        }
        break;
      case 'running':
        return;
      case 'finished':
        this.finished = this.#getNewFinished();
        break;
    }

    const computedTiming = this.#effect.getComputedTiming();

    const computedDuration = computedTiming.activeDuration ?? 0;

    if (computedDuration > 0) {
      if (this.playState === 'paused') {
        this.#flushPausedTime();
        this.#resume();
      } else {
        const computedDelay = computedTiming.delay ?? 0;

        this.startTime = performance.now();
        this.#timeout = setTimeout(() => {
          if (!(this.#effect instanceof KeyframeEffect)) {
            return;
          }

          const keyframes = this.#effect.getKeyframes();
          if (keyframes.length > 1) {
            this.#commitKeyframeStyles(keyframes[0]);
          }

          if (computedTiming.iterations === Infinity) {
            this.#timeout = setInterval(
              () => this.finish(),
              computedDuration * this.playbackRate * durationMultiplier
            );
          } else {
            this.#timeout = setTimeout(
              () => this.finish(),
              computedDuration * this.playbackRate * durationMultiplier
            );
          }

          this.#phase = 'active';
        }, computedDelay * durationMultiplier);
      }

      this.playState = 'running';
    }
  }

  reverse() {
    if (!(this.#effect instanceof KeyframeEffect)) {
      return;
    }

    this.playbackRate = -this.playbackRate;

    if (this.playState === 'running' || this.playState === 'paused') {
      const computedDuration =
        this.#effect.getComputedTiming().activeDuration ?? 0;

      this.#clearTimeout();

      this.#timeout = setTimeout(
        () => this.finish(),
        Math.abs(
          (computedDuration - (this.currentTime as number)) * this.playbackRate
        ) * durationMultiplier
      );
    }
  }

  updatePlaybackRate(playbackRate: number) {
    this.playbackRate = playbackRate;
  }

  // addEventListener() {
  //   console.log("addEventListener isn't implemented yet");
  // }
  // removeEventListener() {
  //   console.log("removeEventListener isn't implemented yet");
  // }
}

if (typeof Animation === 'undefined') {
  Object.defineProperty(window, 'Animation', {
    writable: true,
    configurable: true,
    value: MockedAnimation,
  });
}

export { MockedAnimation, setDurationMultiplier };
