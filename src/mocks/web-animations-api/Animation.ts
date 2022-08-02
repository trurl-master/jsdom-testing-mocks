import { mockKeyframeEffect } from './KeyframeEffect';
import { mockAnimationPlaybackEvent } from './AnimationPlaybackEvent';
import { mockDocumentTimeline } from './DocumentTimeline';
import { getEasingFunctionFromString } from './easingFunctions';

type ActiveAnimationTimeline = AnimationTimeline & {
  currentTime: NonNullable<AnimationTimeline['currentTime']>;
};

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

type DefinedEffectTiming = Required<EffectTiming>;

type DefinedComputedEffectTiming = Required<
  Omit<ComputedEffectTiming, 'localTime' | 'progress'>
> & {
  duration: number;
};

export const NON_STYLE_KEYFRAME_PROPERTIES = ['offset', 'composite', 'easing'];
export const RENAMED_KEYFRAME_PROPERTIES: {
  [key: string]: string;
} = {
  cssFloat: 'float',
  cssOffset: 'offset',
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * Implements https://www.w3.org/TR/web-animations-1
 *
 * With the following differences:
 * - There's no style interpolation
 * - The implementation is based on requestAnimationFrame
 */
class MockedAnimation extends EventTarget implements Animation {
  id = '';
  readonly pending = false;
  readonly replaceState = 'active';

  // implementation details
  #finishedPromise: Promise<Animation>;
  #readyPromise: Promise<Animation>;
  #startTime: CSSNumberish | null = null;
  #pendingPauseTask: (() => void) | null = null;
  #pendingPlayTask: (() => void) | null = null;
  #previousCurrentTime: number | null = null;
  #previousPhase: 'before' | 'active' | 'after' | 'idle' = 'idle';
  #effect: AnimationEffect | null = null;
  #timeline: AnimationTimeline | null = null;
  #rafId: number | null = null;
  #initialKeyframe: ComputedKeyframeStyleProps;
  #fillMode: Omit<FillMode, 'auto'>;
  #promiseStates: {
    finished: 'pending' | 'resolved' | 'rejected';
    ready: 'pending' | 'resolved' | 'rejected';
  } = {
    finished: 'pending',
    ready: 'resolved',
  };
  #resolvers: {
    ready: {
      resolve: (value: Animation | PromiseLike<Animation>) => void;
      reject: (reason: Error) => void;
    };
    finished: {
      resolve: (value: Animation | PromiseLike<Animation>) => void;
      reject: (reason: Error) => void;
    };
  } = {
    ready: {
      resolve: noop,
      reject: noop,
    },
    finished: {
      resolve: noop,
      reject: noop,
    },
  };
  #getRawComputedTiming: () => Omit<
    ComputedEffectTiming,
    'localTime' | 'progress'
  > = () => ({});
  #pendingPlaybackRate: number | null = null;
  #playbackRate = 1;
  #holdTime: number | null = null;

  constructor(
    effect: AnimationEffect | null = null,
    timeline: AnimationTimeline = document.timeline
  ) {
    super();

    this.effect = effect;
    this.#timeline = timeline;
    this.#initialKeyframe = this.#calcInitialKeyframe();
    this.#fillMode = effect?.getComputedTiming().fill ?? 'none';
    this.#finishedPromise = this.#getNewFinishedPromise();
    this.#readyPromise = Promise.resolve(this);
  }

  #getTiming() {
    return this.#effect!.getTiming() as DefinedEffectTiming;
  }

  #getComputedTiming() {
    return this.#getRawComputedTiming.call(
      this.effect
    ) as DefinedComputedEffectTiming;
  }

  get #localTime() {
    // The local time of an animation effect at a given moment is based on the first matching condition from the following:
    //  If the animation effect is associated with an animation,
    //    the local time is the current time of the animation.
    //  Otherwise,
    //    the local time is unresolved.
    if (this.#effect !== null) {
      return this.currentTime;
    }

    return null;
  }

  #getNewFinishedPromise() {
    this.#promiseStates.finished = 'pending';

    return new Promise<Animation>((resolve, reject) => {
      this.#resolvers.finished.resolve = (animation) => {
        this.#promiseStates.finished = 'resolved';
        resolve(animation);
      };
      this.#resolvers.finished.reject = (error) => {
        this.#promiseStates.finished = 'rejected';
        reject(error);
      };
    });
  }

  #getNewReadyPromise() {
    this.#promiseStates.ready = 'pending';

    return new Promise<Animation>((resolve, reject) => {
      this.#resolvers.ready.resolve = (animation) => {
        this.#promiseStates.ready = 'resolved';
        resolve(animation);
      };
      this.#resolvers.ready.reject = (error) => {
        this.#promiseStates.ready = 'rejected';
        reject(error);
      };
    });
  }

  #silentlyRejectFinishedPromise(error: Error) {
    this.#finishedPromise.catch(noop);
    this.#resolvers.finished.reject(error);
  }

  #hasPendingTask() {
    return this.#pendingPauseTask || this.#pendingPlayTask;
  }

  #isTimelineActive(): this is { timeline: ActiveAnimationTimeline } {
    return this.#timeline?.currentTime !== null;
  }

  #hasKeyframeEffect(): this is { effect: KeyframeEffect } {
    return this.#effect instanceof KeyframeEffect;
  }

  #isTimelineMonotonicallyIncreasing() {
    return this.#timeline instanceof DocumentTimeline;
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

  #applyPendingPlaybackRate() {
    if (this.#pendingPlaybackRate !== null) {
      this.#playbackRate = this.#pendingPlaybackRate;
      this.#pendingPlaybackRate = null;
    }
  }

  // ‘backwards’ if the effect is associated with an animation and the associated animation’s playback rate is less than zero; in all other cases, the animation direction is ‘forwards’.
  get #animationDirection() {
    return this.#effect !== null && this.playbackRate < 0
      ? 'backwards'
      : 'forwards';
  }

  // An animation effect is in the before phase if the animation effect’s local time is not unresolved and either of the following conditions are met:
  //   the local time is less than the before-active boundary time, or
  //   the animation direction is ‘backwards’ and the local time is equal to the before-active boundary time.
  // An animation effect is in the after phase if the animation effect’s local time is not unresolved and either of the following conditions are met:
  //   the local time is greater than the active-after boundary time, or
  //   the animation direction is ‘forwards’ and the local time is equal to the active-after boundary time.
  // An animation effect is in the active phase if the animation effect’s local time is not unresolved and it is not in either the before phase nor the after phase.
  // Furthermore, it is often convenient to refer to the case when an animation effect is in none of the above phases as being in the idle phase.
  get #phase() {
    const localTime = this.#localTime;

    if (localTime === null) {
      return 'idle';
    }

    const { delay, activeDuration, endTime } = this.#getComputedTiming();

    const beforeActiveBoundaryTime = Math.max(Math.min(delay, endTime), 0);
    const activeAfterBoundaryTime = Math.max(
      Math.min(delay + activeDuration, endTime),
      0
    );

    if (
      localTime < beforeActiveBoundaryTime ||
      (this.#animationDirection === 'backwards' &&
        localTime === beforeActiveBoundaryTime)
    ) {
      return 'before';
    }

    if (
      localTime > activeAfterBoundaryTime ||
      (this.#animationDirection === 'forwards' &&
        localTime === activeAfterBoundaryTime)
    ) {
      return 'after';
    }

    return 'active';
  }

  // An animation effect is in play if all of the following conditions are met:
  //   the animation effect is in the active phase, and
  //   the animation effect is associated with an animation that is not finished.
  get animationEffectStateInPlay() {
    return this.#phase === 'active' && this.playState !== 'finished';
  }

  // An animation effect is current if any of the following conditions are true:
  //   the animation effect is in play, or
  //   the animation effect is associated with an animation with a playback rate > 0 and the animation effect is in the before phase, or
  //   the animation effect is associated with an animation with a playback rate < 0 and the animation effect is in the after phase.
  get animationEffectStateCurrent() {
    const phase = this.#phase;

    return (
      this.animationEffectStateInPlay ||
      (this.playbackRate > 0 && phase === 'before') ||
      (this.playbackRate < 0 && phase === 'after')
    );
  }

  // An animation effect is in effect if its active time, as calculated according to the procedure in §4.8.3.1 Calculating the active time, is not unresolved.
  get animationEffectStateInEffect() {
    return this.#activeTime !== null;
  }

  get finished() {
    return this.#finishedPromise;
  }

  get ready() {
    return this.#readyPromise;
  }

  get timeline() {
    return this.#timeline;
  }

  // 4.4.1. Setting the timeline of an animation
  set timeline(timeline: AnimationTimeline | null) {
    if (this.#timeline === timeline) {
      return;
    }

    this.#timeline = timeline;

    if (this.startTime !== null) {
      this.#holdTime = null;
    }

    this.#updateFinishedState(false, false);
  }

  get effect() {
    return this.#effect;
  }

  // 4.4.2. Setting the associated effect of an animation
  set effect(effect: AnimationEffect | null) {
    // 1. Let old effect be the current associated effect of animation, if any.
    const oldEffect = this.#effect;

    // 2. If new effect is the same object as old effect, abort this procedure.
    if (effect === oldEffect) {
      return;
    }

    // 3. If animation has a pending pause task, reschedule that task to run as soon as animation is ready.
    if (this.#pendingPauseTask) {
      this.ready.then(() => this.#pendingPauseTask?.());
    }

    // 4. If animation has a pending play task, reschedule that task to run as soon as animation is ready to play new effect.
    if (this.#pendingPlayTask) {
      this.ready.then(() => this.#pendingPlayTask?.());
    }

    // 5. If new effect is not null and if new effect is the associated effect of another animation, previous animation, run the procedure to set the associated effect of an animation (this procedure) on previous animation passing null as new effect.
    if (effect) {
      const anotherAnimation = document
        .getAnimations()
        .find((anim) => anim.effect === effect);

      if (anotherAnimation) {
        anotherAnimation.effect = null;
      }
    }

    // 6. Let the associated effect of animation be new effect.
    this.#effect = effect;

    // 7. Run the procedure to update an animation’s finished state for animation with the did seek flag set to false, and the synchronously notify flag set to false.
    this.#updateFinishedState(false, false);

    if (effect) {
      this.#getRawComputedTiming = effect.getComputedTiming;

      effect.getComputedTiming = () => {
        const computedTiming = this.#getRawComputedTiming.call(effect);

        return {
          ...computedTiming,
          localTime: this.#localTime,
          progress: this.#transformedProgress,
        };
      };
    }
  }

  #resetPendingTasks() {
    // 1. If animation does not have a pending play task or a pending pause task, abort this procedure.
    if (!this.#hasPendingTask()) {
      return;
    }

    // 2. If animation has a pending play task, cancel that task.
    if (this.#pendingPlayTask) {
      this.#pendingPlayTask = null;
    }

    // 3. If animation has a pending pause task, cancel that task.
    if (this.#pendingPauseTask) {
      this.#pendingPauseTask = null;
    }

    // 4. Apply any pending playback rate on animation.
    this.#applyPendingPlaybackRate();

    // 5. Reject animation’s current ready promise with a DOMException named "AbortError".
    this.#silentlyRejectFinishedPromise(
      new DOMException(undefined, 'AbortError')
    );

    // 6. Set the [[PromiseIsHandled]] internal slot of animation’s current ready promise to true.

    // 7. Let animation’s current ready promise be the result of creating a new resolved Promise object with value animation in the relevant Realm of animation.
    this.#readyPromise = Promise.resolve(this);
  }

  #calculateCurrentTime() {
    if (
      !this.#timeline ||
      this.#timeline.currentTime === null ||
      this.startTime === null
    ) {
      return null;
    } else {
      return (this.#timeline.currentTime - this.startTime) * this.playbackRate;
    }
  }

  #calculateStartTime(seekTime: number) {
    let startTime = null;

    if (this.#timeline) {
      const timelineTime = this.#timeline.currentTime;

      if (timelineTime !== null) {
        startTime = timelineTime - seekTime / this.playbackRate;
      }
    }

    return startTime;
  }

  #getCurrentTimeInternal() {
    return this.#holdTime !== null
      ? this.#holdTime
      : this.#calculateCurrentTime();
  }

  // The effective playback rate of an animation is its pending playback rate, if set, otherwise it is the animation’s playback rate.
  get #effectivePlaybackRate() {
    return this.#pendingPlaybackRate ?? this.playbackRate;
  }

  // https://www.w3.org/TR/web-animations-1/#the-current-time-of-an-animation
  // 4.4.3. The current time of an animation
  get currentTime(): CSSNumberish | null {
    return this.#getCurrentTimeInternal();
  }

  // https://www.w3.org/TR/web-animations-1/#setting-the-current-time-of-an-animation
  // 4.4.4. Setting the current time of an animation
  set currentTime(seekTime: number | null) {
    // 1. Run the steps to silently set the current time of animation to seek time.
    this.#setCurrentTimeSilent(seekTime);

    // 2. If animation has a pending pause task, synchronously complete the pause operation by performing the following steps:
    if (this.#pendingPauseTask) {
      // 2.1 Set animation’s hold time to seek time.
      this.#holdTime = seekTime;
      // 2.2 Apply any pending playback rate to animation.
      this.#applyPendingPlaybackRate();
      // 2.3 Make animation’s start time unresolved.
      this.#startTime = null;
      // 2.4 Cancel the pending pause task.
      this.#pendingPauseTask = null;
      // 2.5 Resolve animation’s current ready promise with animation.
      this.#resolvers.ready.resolve(this);
    }

    // 3. Run the procedure to update an animation’s finished state for animation with the did seek flag set to true, and the synchronously notify flag set to false.
    this.#updateFinishedState(true, false);
  }

  #setCurrentTimeSilent(seekTime: number | null) {
    // 1. If seek time is an unresolved time value, then perform the following steps.
    if (seekTime === null) {
      if (this.currentTime !== null) {
        throw new TypeError(
          "Failed to set the 'currentTime' property on 'Animation': currentTime may not be changed from resolved to unresolved"
        );
      }

      return;
    }

    const startTime = this.startTime;
    const holdTime = this.#holdTime;

    // 2. Update either animation’s hold time or start time as follows:
    // 3. If animation has no associated timeline or the associated timeline is inactive, make animation’s start time unresolved.
    if (
      holdTime ||
      startTime === null ||
      this.#timeline === null ||
      this.#timeline.currentTime === null ||
      this.playbackRate == 0
    ) {
      this.#holdTime = seekTime;
    } else {
      this.startTime = this.#calculateStartTime(seekTime);
    }

    // 4. Make animation’s previous current time unresolved.
    this.#previousCurrentTime = null;
  }

  get startTime() {
    return this.#startTime;
  }

  // 4.4.5. Setting the start time of an animation
  set startTime(newTime: number | null) {
    // 1. Let timeline time be the current time value of the timeline that animation is associated with. If there is no timeline associated with animation or the associated timeline is inactive, let the timeline time be unresolved.
    const timelineTime = this.#timeline?.currentTime ?? null;

    // 2. If timeline time is unresolved and new start time is resolved, make animation’s hold time unresolved.
    if (timelineTime === null && newTime !== null) {
      this.#holdTime = null;
    }

    // 3. Let previous current time be animation’s current time.
    this.#previousCurrentTime = this.currentTime;

    // 4. Apply any pending playback rate on animation.
    this.#applyPendingPlaybackRate();

    // 5. Set animation’s start time to new start time.
    this.#startTime = newTime;

    // 6. Update animation’s hold time based on the first matching condition from the following,
    if (newTime !== null) {
      // If animation’s playback rate is not zero, make animation’s hold time unresolved.
      if (this.playbackRate !== 0) {
        this.#holdTime = null;
      }
    } else {
      // Set animation’s hold time to previous current time even if previous current time is unresolved.
      this.#holdTime = this.#previousCurrentTime;
    }

    // 7. If animation has a pending play task or a pending pause task, cancel that task and resolve animation’s current ready promise with animation.
    if (this.#hasPendingTask()) {
      this.#pendingPlayTask = null;
      this.#pendingPauseTask = null;
      this.#resolvers.ready.resolve(this);
    }

    // 8. Run the procedure to update an animation’s finished state for animation with the did seek flag set to true, and the synchronously notify flag set to false.
    this.#updateFinishedState(true, false);
  }

  #iteration() {
    if (!this.#hasKeyframeEffect()) {
      return;
    }

    const playState = this.playState;
    const phase = this.#phase;
    const fillMode = this.#fillMode;
    const keyframes = this.effect.getKeyframes();

    if (playState === 'running' || playState === 'finished') {
      if (this.#previousPhase !== phase) {
        // describes the beginning of the animation
        // either a change from idle to before if moving forwards
        // either a change from idle to after if moving backwards
        if (this.#previousPhase === 'idle') {
          // going forwards
          if (this.playbackRate > 0) {
            if (
              phase === 'before' &&
              (fillMode === 'backwards' || fillMode === 'both')
            ) {
              if (keyframes.length > 1) {
                this.#commitKeyframeStyles(keyframes[0]);
              }
            }
          }
          // going backwards
          else {
            if (
              phase === 'after' &&
              (fillMode === 'forwards' || fillMode === 'both')
            ) {
              this.#commitKeyframeStyles(keyframes[keyframes.length - 1]);
            }
          }
        } else if (this.#previousPhase === 'active') {
          if (phase === 'after') {
            if (fillMode === 'backwards' || fillMode === 'none') {
              this.#commitKeyframeStyles(this.#initialKeyframe);
            }
          } else if (phase === 'before') {
            if (fillMode === 'forwards' || fillMode === 'none') {
              this.#commitKeyframeStyles(this.#initialKeyframe);
            }
          }
        }
      }

      if (phase === 'active') {
        this.commitStyles();
      }

      if (playState === 'running') {
        this.#rafId = requestAnimationFrame(() => {
          this.#iteration();
        });
      }

      this.#previousPhase = phase;
    }

    this.#updateFinishedState(false, true);
  }

  #cancelIteration() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #playTask() {
    this.#pendingPlayTask = null;

    // assert timeline
    if (!this.#isTimelineActive()) {
      throw new Error(
        "Failed to play an 'Animation': the animation's timeline is inactive"
      );
    }

    // 1. Assert that at least one of animation’s start time or hold time is resolved.
    if (this.#startTime === null && this.#holdTime === null) {
      throw new Error(
        "Failed to play an 'Animation': the start time or hold time must be resolved"
      );
    }

    // 2. Let ready time be the time value of the timeline associated with animation at the moment when animation became ready.
    const readyTime = this.timeline.currentTime;

    // console.log('readyTime', readyTime, this.#holdTime, this.startTime);

    // 3. Perform the steps corresponding to the first matching condition below, if any:
    // If animation’s hold time is resolved,
    //   Apply any pending playback rate on animation.
    //   Let new start time be the result of evaluating ready time - hold time / playback rate for animation. If the playback rate is zero, let new start time be simply ready time.
    //   Set the start time of animation to new start time.
    //   If animation’s playback rate is not 0, make animation’s hold time unresolved.
    // If animation’s start time is resolved and animation has a pending playback rate,
    //   Let current time to match be the result of evaluating (ready time - start time) × playback rate for animation.
    //   Apply any pending playback rate on animation.
    //   If animation’s playback rate is zero, let animation’s hold time be current time to match.
    //   Let new start time be the result of evaluating ready time - current time to match / playback rate for animation. If the playback rate is zero, let new start time be simply ready time.
    //   Set the start time of animation to new start time.

    if (this.#holdTime !== null) {
      this.#applyPendingPlaybackRate();
      const newStartTime =
        this.#playbackRate === 0
          ? readyTime
          : readyTime - this.#holdTime / this.#playbackRate;

      this.startTime = newStartTime;
    } else if (this.#startTime !== null && this.#pendingPlaybackRate !== null) {
      const currentTimeToMatch =
        (readyTime - this.#startTime) * this.playbackRate;

      this.#applyPendingPlaybackRate();

      if (this.#playbackRate === 0) {
        this.#holdTime = currentTimeToMatch;
      } else {
        const newStartTime =
          readyTime - currentTimeToMatch / this.#playbackRate;
        this.startTime = newStartTime;
      }
    }

    // 4. Resolve animation’s current ready promise with animation.
    this.#resolvers.ready.resolve(this);

    // 5. Run the procedure to update an animation’s finished state for animation with the did seek flag set to false, and the synchronously notify flag set to false.
    this.#updateFinishedState(false, false);
  }

  #play(autoRewind: boolean) {
    // 1. Let aborted pause be a boolean flag that is true if animation has a pending pause task, and false otherwise.
    const abortedPause = this.#pendingPauseTask !== null;

    // 2. Let has pending ready promise be a boolean flag that is initially false.
    let hasPendingReadyPromise = false;

    // 3. Let seek time be a time value that is initially unresolved.
    let seekTime: number | null = null;

    // 4. Let has finite timeline be true if animation has an associated timeline that is not monotonically increasing.
    const hasFiniteTimeline =
      this.#timeline && !this.#isTimelineMonotonicallyIncreasing();

    // 5. Perform the steps corresponding to the first matching condition from the following, if any:
    const currentTime = this.currentTime;
    const effectEnd = this.#getComputedTiming().endTime;

    // condition 1
    if (
      this.#effectivePlaybackRate > 0 &&
      autoRewind &&
      (currentTime === null || currentTime < 0 || currentTime >= effectEnd)
    ) {
      seekTime = 0;
    }
    // condition 2
    else if (
      this.#effectivePlaybackRate < 0 &&
      autoRewind &&
      (currentTime === null || currentTime <= 0 || currentTime > effectEnd)
    ) {
      if (effectEnd === Infinity) {
        throw new DOMException(
          "Failed to execute 'play' on 'Animation': Cannot play reversed Animation with infinite target effect end.",
          'InvalidStateError'
        );
      }

      seekTime = effectEnd;
    }
    // condition 3
    else if (this.#effectivePlaybackRate === 0 && currentTime === null) {
      seekTime = 0;
    }

    // 6. If seek time is resolved,
    if (seekTime !== null) {
      if (hasFiniteTimeline) {
        this.startTime = seekTime;
        this.#holdTime = null;
        this.#applyPendingPlaybackRate();
      } else {
        this.#holdTime = seekTime;
      }
    }

    // 7. If animation’s hold time is resolved, let its start time be unresolved.
    if (this.#holdTime !== null) {
      this.startTime = null;
    }

    // 8. If animation has a pending play task or a pending pause task,
    if (this.#hasPendingTask()) {
      this.#pendingPauseTask = null;
      this.#pendingPlayTask = null;
      hasPendingReadyPromise = true;
    }

    // 9. If the following four conditions are all satisfied:
    // If the following four conditions are all satisfied:
    //   animation’s hold time is unresolved, and
    //   seek time is unresolved, and
    //   aborted pause is false, and
    //   animation does not have a pending playback rate,
    //     abort this procedure.
    if (
      this.#holdTime === null &&
      seekTime === null &&
      !abortedPause &&
      this.#pendingPlaybackRate === null
    ) {
      return;
    }

    // 10. If has pending ready promise is false, let animation’s current ready promise be a new promise in the relevant Realm of animation.
    if (!hasPendingReadyPromise) {
      this.#readyPromise = this.#getNewReadyPromise();
    }

    // 11. Schedule a task to run as soon as animation is ready. The task shall perform the following steps:
    this.#pendingPlayTask = () => {
      this.#playTask();
    };

    this.ready.then(() => {
      this.#pendingPlayTask?.();
      this.#iteration();
    });

    queueMicrotask(() => {
      this.#resolvers.ready.resolve(this);
    });

    // 12. Run the procedure to update an animation’s finished state for animation with the did seek flag set to false, and the synchronously notify flag set to false.
    this.#updateFinishedState(false, false);
  }

  // 4.4.8. Playing an animation
  // https://www.w3.org/TR/web-animations-1/#playing-an-animation-section
  play() {
    this.#play(true);
  }

  #pauseTask() {
    this.#pendingPauseTask = null;

    // assert timeline
    if (!this.#isTimelineActive()) {
      throw new Error(
        "Failed to pause an 'Animation': the animation's timeline is inactive"
      );
    }

    // 1. Let ready time be the time value of the timeline associated with animation at the moment when the user agent completed processing necessary to suspend playback of animation’s associated effect.
    const readyTime = this.timeline.currentTime;

    // 2. If animation’s start time is resolved and its hold time is not resolved, let animation’s hold time be the result of evaluating (ready time - start time) × playback rate.
    if (this.#startTime !== null && this.#holdTime === null) {
      this.#holdTime = (readyTime - this.#startTime) * this.#playbackRate;
    }

    // Note: The hold time might be already set if the animation is finished, or if the animation has a pending play task. In either case we want to preserve the hold time as we enter the paused state.

    // 3. Apply any pending playback rate on animation.
    this.#applyPendingPlaybackRate();

    // 4. Make animation’s start time unresolved.
    this.#startTime = null;

    // 5. Resolve animation’s current ready promise with animation.
    this.#resolvers.ready.resolve(this);

    // 6. Run the procedure to update an animation’s finished state for animation with the did seek flag set to false, and the synchronously notify flag set to false.
    this.#updateFinishedState(false, false);
  }

  // 4.4.9. Pausing an animation
  // https://www.w3.org/TR/web-animations-1/#pausing-an-animation-section
  pause() {
    // 1. If animation has a pending pause task, abort these steps.
    if (this.#pendingPauseTask !== null) {
      return;
    }

    // 2. If the play state of animation is paused, abort these steps.
    if (this.playState === 'paused') {
      return;
    }

    // 3. Let seek time be a time value that is initially unresolved.
    let seekTime: number | null = null;

    // 4. Let has finite timeline be true if animation has an associated timeline that is not monotonically increasing.
    const hasFiniteTimeline =
      this.#timeline && !this.#isTimelineMonotonicallyIncreasing();

    // 5. If the animation’s current time is unresolved, perform the steps according to the first matching condition from below:
    //    If animation’s playback rate is ≥ 0,
    //      Set seek time to zero.
    //    Otherwise,
    //      If associated effect end for animation is positive infinity,
    //        throw an "InvalidStateError" DOMException and abort these steps.
    //      Otherwise,
    //        Set seek time to animation’s associated effect end.
    const currentTime = this.currentTime;
    const effectEnd = this.#getComputedTiming().endTime;

    if (currentTime === null) {
      if (this.#playbackRate >= 0) {
        seekTime = 0;
      } else {
        if (effectEnd === Infinity) {
          throw new DOMException(
            "Failed to execute 'pause' on 'Animation': Cannot play reversed Animation with infinite target effect end.",
            'InvalidStateError'
          );
        } else {
          seekTime = effectEnd;
        }
      }
    }

    // 6. If seek time is resolved,
    //      If has finite timeline is true,
    //        Set animation’s start time to seek time.
    //      Otherwise,
    //        Set animation’s hold time to seek time.
    if (seekTime !== null) {
      if (hasFiniteTimeline) {
        this.startTime = seekTime;
      } else {
        this.#holdTime = seekTime;
      }
    }

    // 7. Let has pending ready promise be a boolean flag that is initially false.
    let hasPendingReadyPromise = false;

    // 8. If animation has a pending play task, cancel that task and let has pending ready promise be true.
    if (this.#pendingPlayTask !== null) {
      this.#pendingPlayTask = null;
      hasPendingReadyPromise = true;
    }

    // 9. If has pending ready promise is false, set animation’s current ready promise to a new promise in the relevant Realm of animation.
    if (!hasPendingReadyPromise) {
      this.#readyPromise = this.#getNewReadyPromise();
    }

    // 10. Schedule a task to be executed at the first possible moment when
    //       the animation is associated with a timeline that is not inactive.
    this.#pendingPauseTask = () => {
      this.#pauseTask();
    };

    queueMicrotask(() => {
      this.#pendingPauseTask?.();

      // 11. Run the procedure to update an animation’s finished state for animation with the did seek flag set to false, and the synchronously notify flag set to false.
      this.#updateFinishedState(false, false);
    });

    this.#cancelIteration();
  }

  // 4.4.12. Updating the finished state
  // https://www.w3.org/TR/web-animations-1/#updating-the-finished-state
  #finishNotification() {
    // 1. If animation’s play state is not equal to finished, abort these steps.
    if (this.playState !== 'finished') {
      return;
    }

    // 2. Resolve animation’s current finished promise object with animation.
    this.#resolvers.finished.resolve(this);

    // 3. Create an AnimationPlaybackEvent, finishEvent.
    // Set finishEvent’s type attribute to finish.
    // Set finishEvent’s currentTime attribute to the current time of animation.
    // Set finishEvent’s timelineTime attribute to the current time of the timeline with which animation is associated. If animation is not associated with a timeline, or the timeline is inactive, let timelineTime be null.
    const finishEvent = new AnimationPlaybackEvent('finish', {
      currentTime: this.currentTime,
      timelineTime: this.timeline ? this.timeline.currentTime : null,
    });

    // 7. If animation has a document for timing, then append finishEvent to its document for timing's pending animation event queue along with its target, animation. For the scheduled event time, use the result of converting animation’s associated effect end to an origin-relative time.
    //    Otherwise, queue a task to dispatch finishEvent at animation. The task source for this task is the DOM manipulation task source.

    this.dispatchEvent(finishEvent);
    this.onfinish?.(finishEvent);
  }

  #queuedFinishNotificationMicrotask: (() => void) | null = null;

  #cancelFinishNotificationMicrotask() {
    this.#queuedFinishNotificationMicrotask = null;
  }

  #queueFinishNotificationMicrotask() {
    if (this.#queuedFinishNotificationMicrotask === null) {
      this.#queuedFinishNotificationMicrotask = () => {
        this.#finishNotification();
        this.#queuedFinishNotificationMicrotask = null;
      };

      queueMicrotask(() => this.#queuedFinishNotificationMicrotask?.());
    }
  }

  #updateFinishedState(
    // indicates if the update is being performed after setting the current time
    didSeek: boolean,
    // indicates the update was called in a context where we expect finished event queueing and finished promise resolution to happen immediately, if at all
    synchronouslyNotify: boolean
  ) {
    // 1. Let the unconstrained current time be the result of calculating the current time substituting an unresolved time value for the hold time if did seek is false. If did seek is true, the unconstrained current time is equal to the current time.
    const unconstrainedCurrentTime = didSeek
      ? this.#calculateCurrentTime()
      : this.currentTime;

    // 2. If all three of the following conditions are true,
    //   the unconstrained current time is resolved, and
    //   animation’s start time is resolved, and
    //   animation does not have a pending play task or a pending pause task, then update animation’s hold time based on the first matching condition for animation from below, if any:
    //   If playback rate > 0 and unconstrained current time is greater than or equal to associated effect end,
    //     If did seek is true, let the hold time be the value of unconstrained current time.
    //     If did seek is false, let the hold time be the maximum value of previous current time and associated  effect end. If the previous current time is unresolved, let the hold time be associated effect end.
    //   If playback rate < 0 and unconstrained current time is less than or equal to 0,
    //     If did seek is true, let the hold time be the value of unconstrained current time.
    //     If did seek is false, let the hold time be the minimum value of previous current time and zero. If the previous current time is unresolved, let the hold time be zero.
    //   If playback rate ≠ 0, and animation is associated with an active timeline,
    //     Perform the following steps:
    //       If did seek is true and the hold time is resolved, let animation’s start time be equal to the result of evaluating timeline time - (hold time / playback rate) where timeline time is the current time value of timeline associated with animation.
    //       Let the hold time be unresolved.
    const startTime = this.startTime;
    const effectEnd = this.#getComputedTiming().endTime;

    if (
      unconstrainedCurrentTime !== null &&
      startTime !== null &&
      !this.#hasPendingTask()
    ) {
      // If playback rate > 0 and unconstrained current time is greater than or equal to associated effect end,
      //   If did seek is true, let the hold time be the value of unconstrained current time.
      //   If did seek is false, let the hold time be the maximum value of previous current time and associated effect end. If the previous current time is unresolved, let the hold time be associated effect end.
      // If playback rate < 0 and unconstrained current time is less than or equal to 0,
      //   If did seek is true, let the hold time be the value of unconstrained current time.
      //   If did seek is false, let the hold time be the minimum value of previous current time and zero. If the previous current time is unresolved, let the hold time be zero.
      // If playback rate ≠ 0, and animation is associated with an active timeline,
      //   Perform the following steps:
      //   1. If did seek is true and the hold time is resolved, let animation’s start time be equal to the result of evaluating timeline time - (hold time / playback rate) where timeline time is the current time value of timeline associated with animation.
      //   2. Let the hold time be unresolved.
      const playbackRate = this.playbackRate;

      if (playbackRate > 0 && unconstrainedCurrentTime >= effectEnd) {
        if (didSeek) {
          this.#holdTime = unconstrainedCurrentTime;
        } else {
          if (this.#previousCurrentTime === null) {
            this.#holdTime = effectEnd;
          } else {
            this.#holdTime = Math.max(this.#previousCurrentTime, effectEnd);
          }
        }
      } else if (playbackRate < 0 && unconstrainedCurrentTime <= 0) {
        if (didSeek) {
          this.#holdTime = unconstrainedCurrentTime;
        } else {
          if (this.#previousCurrentTime === null) {
            this.#holdTime = 0;
          } else {
            this.#holdTime = Math.min(this.#previousCurrentTime, 0);
          }
        }
      } else if (playbackRate !== 0 && this.#isTimelineActive()) {
        if (didSeek && this.#holdTime !== null) {
          this.startTime =
            this.timeline.currentTime - this.#holdTime / playbackRate;
        }
        this.#holdTime = null;
      }
    }

    // 3. Set the previous current time of animation be the result of calculating its current time.
    this.#previousCurrentTime = this.#calculateCurrentTime();

    // 4. Let current finished state be true if the play state of animation is finished. Otherwise, let it be false.
    const currentFinishedState = this.playState === 'finished';

    // 5. If current finished state is true and the current finished promise is not yet resolved, perform the following steps
    //    If synchronously notify is true, cancel any queued microtask to run the finish notification steps for this animation, and run the finish notification steps immediately.
    //    Otherwise, if synchronously notify is false, queue a microtask to run finish notification steps for animation unless there is already a microtask queued to run those steps for animation.
    // console.log(
    //   'finishing!',
    //   currentFinishedState,
    //   this.#promiseStates.finished !== 'resolved',
    //   synchronouslyNotify
    // );

    if (currentFinishedState && this.#promiseStates.finished !== 'resolved') {
      if (synchronouslyNotify) {
        this.#cancelFinishNotificationMicrotask();
        this.#finishNotification();
      } else {
        this.#queueFinishNotificationMicrotask();
        // this.#queueMicrotask(() => this.#finishNotification());
      }
    }

    // 6. If current finished state is false and animation’s current finished promise is already resolved, set animation’s current finished promise to a new promise in the relevant Realm of animation.
    if (!currentFinishedState && this.#promiseStates.finished === 'resolved') {
      this.#finishedPromise = this.#getNewFinishedPromise();
    }
  }

  // 4.4.13. Finishing an animation
  finish() {
    // 1. If animation’s effective playback rate is zero, or if animation’s effective playback rate > 0 and associated effect end is infinity, throw an "InvalidStateError" DOMException and abort these steps.
    const effectivePlaybackRate = this.#effectivePlaybackRate;
    const effectEnd = this.#getComputedTiming().endTime;

    if (
      effectivePlaybackRate === 0 ||
      (effectivePlaybackRate > 0 && effectEnd === Infinity)
    ) {
      throw new DOMException(
        "Failed to execute 'finish' on 'Animation': Cannot finish Animation with an infinite target effect end.",
        'InvalidStateError'
      );
    }

    // 2. Apply any pending playback rate to animation.
    this.#applyPendingPlaybackRate();

    // 3. Set limit as follows:
    //      If playback rate > 0,
    //        Let limit be associated effect end.
    //      Otherwise,
    //        Let limit be zero.
    const limit = this.#playbackRate > 0 ? effectEnd : 0;

    // 4. Silently set the current time to limit.
    this.#setCurrentTimeSilent(limit);

    // 5. If animation’s start time is unresolved and animation has an associated active timeline, let the start time be the result of evaluating timeline time - (limit / playback rate) where timeline time is the current time value of the associated timeline.
    if (this.#startTime === null && this.#isTimelineActive()) {
      this.#startTime = this.timeline.currentTime - limit / this.#playbackRate;
    }

    // 6. If there is a pending pause task and start time is resolved,
    // 6.1 Let the hold time be unresolved.
    //     > Typically the hold time will already be unresolved except in the case when the animation was previously idle.
    // 6.2 Cancel the pending pause task.
    // 6.3 Resolve the current ready promise of animation with animation.
    if (this.#pendingPauseTask !== null && this.#startTime !== null) {
      this.#holdTime = null;
      this.#pendingPauseTask = null;
      this.#resolvers.ready.resolve(this);
    }

    // 7. If there is a pending play task and start time is resolved, cancel that task and resolve the current ready promise of animation with animation.
    if (this.#pendingPlayTask !== null && this.#startTime !== null) {
      this.#pendingPlayTask = null;
      this.#resolvers.ready.resolve(this);
    }

    // 8. Run the procedure to update an animation’s finished state for animation with the did seek flag set to true, and the synchronously notify flag set to true.
    this.#updateFinishedState(true, true);
  }

  // 4.4.14. Canceling an animation
  // https://www.w3.org/TR/web-animations-1/#canceling-an-animation-section
  cancel() {
    if (!this.#hasKeyframeEffect()) {
      return;
    }

    // 1. If animation’s play state is not idle, perform the following steps:
    if (this.playState !== 'idle') {
      // Run the procedure to reset an animation’s pending tasks on animation.
      this.#resetPendingTasks();

      // Reject the current finished promise with a DOMException named "AbortError".
      this.#silentlyRejectFinishedPromise(
        new DOMException('The user aborted a request.', 'AbortError')
      );

      // Set the [[PromiseIsHandled]] internal slot of the current finished promise to true.

      // Let current finished promise be a new promise in the relevant Realm of animation.
      this.#finishedPromise = this.#getNewFinishedPromise();

      // Let timeline time be the current time of the timeline with which animation is associated. If animation is not associated with an active timeline, let timeline time be n unresolved time value.
      const timelineTime = this.timeline?.currentTime ?? null;

      // Create an AnimationPlaybackEvent, cancelEvent.
      // Set cancelEvent’s type attribute to cancel.
      // Set cancelEvent’s currentTime to null.
      // Set cancelEvent’s timelineTime to timeline time. If timeline time is unresolved, set it to null.
      const cancelEvent = new AnimationPlaybackEvent('cancel', {
        currentTime: null,
        timelineTime,
      });

      // If animation has a document for timing, then append cancelEvent to its document for timing's pending animation event queue along with its target, animation. If animation is associated with an active timeline that defines a procedure to convert timeline times to origin-relative time, let the scheduled event time be the result of applying that procedure to timeline time. Otherwise, the scheduled event time is an unresolved time value.

      // Otherwise, queue a task to dispatch cancelEvent at animation. The task source for this task is the DOM manipulation task source.
      this.dispatchEvent(cancelEvent);
      this.oncancel?.(cancelEvent);
    } else {
      // it's not in the spec, but chrome does it
      this.#pendingPlaybackRate = null;
      this.#pendingPauseTask = this.#pendingPlayTask = null;
    }

    // 2. Make animation’s hold time unresolved.
    this.#holdTime = null;

    // 3. Make animation’s start time unresolved.
    this.#startTime = null;
  }

  get playbackRate() {
    return this.#playbackRate;
  }

  // 4.4.15.1. Setting the playback rate of an animation
  set playbackRate(rate: number) {
    // 1. Clear any pending playback rate on animation.
    this.#pendingPlaybackRate = null;

    // 2. Let previous time be the value of the current time of animation before changing the playback rate.
    const previousTime = this.currentTime;

    // 3. Set the playback rate to new playback rate.
    this.#playbackRate = rate;

    // 4. If previous time is resolved, set the current time of animation to previous time
    if (previousTime !== null) {
      this.currentTime = previousTime;
    }
  }

  // 4.4.15.2. Seamlessly updating the playback rate of an animation
  // https://www.w3.org/TR/web-animations-1/#seamlessly-updating-the-playback-rate-of-an-animation
  updatePlaybackRate(playbackRate: number) {
    // 1. Let previous play state be animation’s play state.
    const previousPlayState = this.playState;

    // 2. Let animation’s pending playback rate be new playback rate.
    this.#pendingPlaybackRate = playbackRate;

    // 3. Perform the steps corresponding to the first matching condition from below:
    // If animation has a pending play task or a pending pause task, abort these steps.
    if (this.#hasPendingTask()) {
      return;
    }

    switch (previousPlayState) {
      // If previous play state is idle or paused, apply any pending playback rate on animation.
      case 'idle':
      case 'paused':
        this.#applyPendingPlaybackRate();
        break;

      case 'finished':
        {
          // 1. Let the unconstrained current time be the result of calculating the current time of animation substituting an unresolved time value for the hold time.
          const unconstrainedCurrentTime =
            this.#calculateCurrentTime() ?? this.#holdTime;

          // 2. Let animation’s start time be the result of evaluating the following expression:
          // timeline time - (unconstrained current time / pending playback rate)
          // Where timeline time is the current time value of the timeline associated with animation.
          const timelineTime = this.timeline?.currentTime ?? null;

          if (this.#pendingPlaybackRate !== 0) {
            if (timelineTime) {
              this.#startTime = unconstrainedCurrentTime
                ? timelineTime -
                  unconstrainedCurrentTime / this.#pendingPlaybackRate
                : null;
            }
          } else {
            // 3. If pending playback rate is zero, let animation’s start time be timeline time.
            this.#startTime = timelineTime;
          }

          // 4. Apply any pending playback rate on animation.
          this.#applyPendingPlaybackRate();

          // 5. Run the procedure to update an animation’s finished state for animation with the did seek flag set to false, and the synchronously notify flag set to false.
          this.#updateFinishedState(false, false);
        }
        break;

      case 'running':
        this.#cancelIteration();

        // Run the procedure to play an animation for animation with the auto-rewind flag set to false.
        this.#play(false);
        break;
    }
  }

  // 4.4.16. Reversing an animation
  // https://www.w3.org/TR/web-animations-1/#reversing-an-animation-section
  reverse() {
    // 1. If there is no timeline associated with animation, or the associated timeline is inactive throw an "InvalidStateError" DOMException and abort these steps.
    if (this.timeline === null || !this.#isTimelineActive()) {
      throw new DOMException(
        'Cannot reverse an animation with no active timeline',
        'InvalidStateError'
      );
    }

    // 2. Let original pending playback rate be animation’s pending playback rate.
    const originalPendingPlaybackRate = this.#pendingPlaybackRate;

    // 3. Let animation’s pending playback rate be the additive inverse of its effective playback rate (i.e. -effective playback rate).
    this.#pendingPlaybackRate = -this.#effectivePlaybackRate;

    this.#cancelIteration();

    // 4. Run the steps to play an animation for animation with the auto-rewind flag set to true.
    //    If the steps to play an animation throw an exception, set animation’s pending playback rate to original pending playback rate and propagate the exception.
    try {
      this.#play(true);
    } catch (error) {
      this.#pendingPlaybackRate = originalPendingPlaybackRate;
      throw error;
    }
  }

  // 4.4.17. Play states
  // https://www.w3.org/TR/web-animations-1/#play-states
  get playState() {
    // The play state of animation, animation, at a given moment is the state corresponding to the first matching condition from the following:

    const currentTime = this.currentTime;

    // All of the following conditions are true:
    //   The current time of animation is unresolved, and
    //   the start time of animation is unresolved, and
    //   animation does not have either a pending play task or a pending pause task,
    //     → idle
    if (
      currentTime === null &&
      this.#startTime === null &&
      !this.#hasPendingTask()
    ) {
      return 'idle';
    }

    // Either of the following conditions are true:
    //   animation has a pending pause task, or
    //   both the start time of animation is unresolved and it does not have a pending play task,
    //     → paused
    else if (
      this.#pendingPauseTask !== null ||
      (this.startTime === null && this.#pendingPlayTask === null)
    ) {
      return 'paused';
    }

    // For animation, current time is resolved and either of the following conditions are true:
    //   animation’s effective playback rate > 0 and current time ≥ associated effect end; or
    //   animation’s effective playback rate < 0 and current time ≤ 0,
    //     → finished
    else if (
      currentTime !== null &&
      ((this.#effectivePlaybackRate > 0 &&
        currentTime >= this.#getComputedTiming().endTime) ||
        (this.#effectivePlaybackRate < 0 && currentTime <= 0))
    ) {
      return 'finished';
    }

    // Otherwise,
    //   → running
    else {
      return 'running';
    }
  }

  set playState(_newPlayState: AnimationPlayState) {
    throw new TypeError(
      'Cannot set property playState of #<Animation> which has only a getter'
    );
  }

  // 4.8.3.1. Calculating the active time
  // If the animation effect is in the before phase,
  //   The result depends on the first matching condition from the following,
  //     If the fill mode is backwards or both,
  //       Return the result of evaluating max(local time - start delay, 0).
  //     Otherwise,
  //       Return an unresolved time value.
  // If the animation effect is in the active phase,
  //   Return the result of evaluating local time - start delay.
  // If the animation effect is in the after phase,
  //   The result depends on the first matching condition from the following,
  //     If the fill mode is forwards or both,
  //       Return the result of evaluating max(min(local time - start delay, active duration), 0).
  //     Otherwise,
  //       Return an unresolved time value.
  // Otherwise (the local time is unresolved),
  //   Return an unresolved time value.
  get #activeTime() {
    const computedTiming = this.#getComputedTiming();
    const localTime = this.#localTime;

    if (localTime === null) {
      return null;
    }

    switch (this.#phase) {
      case 'before':
        if (this.#fillMode === 'backwards' || this.#fillMode === 'both') {
          return Math.max(localTime - computedTiming.delay, 0);
        } else {
          return null;
        }
      case 'active':
        return localTime - computedTiming.delay;
      case 'after':
        if (this.#fillMode === 'forwards' || this.#fillMode === 'both') {
          return Math.max(
            Math.min(
              localTime - computedTiming.delay,
              computedTiming.activeDuration
            ),
            0
          );
        } else {
          return null;
        }
      default:
        return null;
    }
  }

  // 4.8.3.2. Calculating the overall progress
  // The overall progress describes the number of iterations that have completed (including partial iterations) and is defined as follows:
  // 1. If the active time is unresolved, return unresolved.
  // 2. Calculate an initial value for overall progress based on the first matching condition from below,
  //   If the iteration duration is zero,
  //     If the animation effect is in the before phase, let overall progress be zero, otherwise, let it be equal to the iteration count.
  //   Otherwise,
  //     Let overall progress be the result of calculating active time / iteration duration.
  // 3. Return the result of calculating overall progress + iteration start.
  get #overallProgress() {
    const activeTime = this.#activeTime;

    if (activeTime === null) {
      return null;
    }

    const computedTiming = this.#getComputedTiming();

    let overallProgress: number;

    if (computedTiming.duration === 0) {
      if (this.#phase === 'before') {
        overallProgress = 0;
      } else {
        overallProgress = computedTiming.iterations;
      }
    } else {
      overallProgress = activeTime / computedTiming.duration;
    }

    return overallProgress + computedTiming.iterationStart;
  }

  // 4.8.3.3. Calculating the simple iteration progress
  // https://www.w3.org/TR/web-animations-1/#calculating-the-simple-iteration-progress
  // The simple iteration progress is a fraction of the progress through the current iteration that ignores transformations to the time introduced by the playback direction or timing functions applied to the effect, and is calculated as follows:
  // 1. If the overall progress is unresolved, return unresolved.
  // 2. If overall progress is infinity, let the simple iteration progress be iteration start % 1.0, otherwise, let the simple iteration progress be overall progress % 1.0.
  // 3. If all of the following conditions are true,
  //   the simple iteration progress calculated above is zero, and
  //   the animation effect is in the active phase or the after phase, and
  //   the active time is equal to the active duration, and
  //   the iteration count is not equal to zero.
  // let the simple iteration progress be 1.0.
  // 4. Return simple iteration progress.
  get #iterationProgress() {
    const overallProgress = this.#overallProgress;

    if (overallProgress === null) {
      return null;
    }

    const computedTiming = this.#getComputedTiming();

    let iterationProgress: number;

    if (overallProgress === Infinity) {
      iterationProgress = computedTiming.iterationStart % 1.0;
    } else {
      iterationProgress = overallProgress % 1.0;
    }

    if (
      iterationProgress === 0 &&
      (this.#phase === 'active' || this.#phase === 'after') &&
      this.#activeTime === computedTiming.activeDuration &&
      computedTiming.iterations !== 0
    ) {
      iterationProgress = 1.0;
    }

    return iterationProgress;
  }

  // 4.8.4. Calculating the current iteration
  // https://www.w3.org/TR/web-animations-1/#calculating-the-current-iteration
  // The current iteration can be calculated using the following steps:
  //   If the active time is unresolved, return unresolved.
  //   If the animation effect is in the after phase and the iteration count is infinity, return infinity.
  //   If the simple iteration progress is 1.0, return floor(overall progress) - 1.
  //   Otherwise, return floor(overall progress).
  get #currentIteration() {
    const activeTime = this.#activeTime;

    if (activeTime === null) {
      return null;
    }

    const timing = this.#getTiming();

    if (this.#phase === 'after' && timing.iterations === Infinity) {
      return Infinity;
    }

    const iterationProgress = this.#iterationProgress;

    // overall progress should be defined here, see #overallProgress getter
    const overallProgress = this.#overallProgress!;

    if (iterationProgress === 1.0) {
      return Math.floor(overallProgress) - 1;
    } else {
      return Math.floor(overallProgress);
    }
  }

  // 4.9.1. Calculating the directed progress
  // https://www.w3.org/TR/web-animations-1/#calculating-the-directed-progress
  // The directed progress is calculated from the simple iteration progress using the following steps:
  // 1. If the simple iteration progress is unresolved, return unresolved.
  // 2. Calculate the current direction using the first matching condition from the following list:
  //   If playback direction is normal,
  //     Let the current direction be forwards.
  //   If playback direction is reverse,
  //     Let the current direction be reverse.
  //   Otherwise,
  //     Let d be the current iteration.
  //     If playback direction is alternate-reverse increment d by 1.
  //     If d % 2 == 0, let the current direction be forwards, otherwise let the current direction be reverse. If d is infinity, let the current direction be forwards.
  // 3. If the current direction is forwards then return the simple iteration progress.
  //   Otherwise, return 1.0 - simple iteration progress.
  get #currentDirection() {
    if (this.#currentIteration === null) {
      return null;
    }

    const timing = this.#getTiming();

    let currentDirection: 'forwards' | 'reverse';
    const playbackDirection = timing.direction;

    if (playbackDirection === 'normal') {
      currentDirection = 'forwards';
    } else if (playbackDirection === 'reverse') {
      currentDirection = 'reverse';
    } else {
      let currentIteration = this.#currentIteration;

      if (playbackDirection === 'alternate-reverse') {
        currentIteration += 1;
      }

      if (currentIteration === Infinity || currentIteration % 2 === 0) {
        currentDirection = 'forwards';
      } else {
        currentDirection = 'reverse';
      }
    }

    return currentDirection;
  }

  get #directedProgress() {
    const iterationProgress = this.#iterationProgress;

    if (iterationProgress === null) {
      return null;
    }

    const currentDirection = this.#currentDirection;

    if (currentDirection === 'forwards') {
      return iterationProgress;
    } else {
      return 1.0 - iterationProgress;
    }
  }

  // 4.10.1. Calculating the transformed progress
  // https://www.w3.org/TR/web-animations-1/#calculating-the-transformed-progress
  // The transformed progress is calculated from the directed progress using the following steps:
  // 1. If the directed progress is unresolved, return unresolved.
  // 2. Calculate the value of the before flag as follows:
  // 2.1. Determine the current direction using the procedure defined in §4.9.1 Calculating the directed progress.
  // 2.2. If the current direction is forwards, let going forwards be true, otherwise it is false.
  // 2.3. The before flag is set if the animation effect is in the before phase and going forwards is true; or if the animation effect is in the after phase and going forwards is false.
  // 3. Return the result of evaluating the animation effect’s timing function passing directed progress as the input progress value and before flag as the before flag.
  get #transformedProgress() {
    const directedProgress = this.#directedProgress;
    const timing = this.#getTiming();

    if (directedProgress === null || typeof timing === 'undefined') {
      return null;
    }

    const timingFunction = getEasingFunctionFromString(timing.easing);

    const currentDirection = directedProgress >= 0 ? 'forwards' : 'reverse';

    const beforeFlag =
      (this.#phase === 'before' && currentDirection === 'forwards') ||
      (this.#phase === 'after' && currentDirection === 'reverse');

    return timingFunction(directedProgress, beforeFlag);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null =
    null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null =
    null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onremove: ((this: Animation, ev: Event) => any) | null = null;

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
    if (
      !(this.#effect instanceof KeyframeEffect) ||
      !this.#isTimelineActive()
    ) {
      return;
    }

    const keyframes = this.#effect.getKeyframes();
    // const currentProgress = this.#effect.getComputedTiming().progress;
    const currentProgress = this.#transformedProgress;
    const currentDirection = this.#currentDirection;

    if (
      keyframes.length === 0 ||
      currentProgress === null ||
      currentDirection === null ||
      !this.#effect.target
    ) {
      return;
    }

    if (
      keyframes.length === 1 &&
      ((currentDirection === 'forwards' && currentProgress <= 0.5) ||
        (currentDirection === 'reverse' && currentProgress >= 0.5))
    ) {
      this.#commitKeyframeStyles(this.#initialKeyframe);
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

  persist() {
    console.log("persist isn't implemented yet");
  }
}

function mockAnimation() {
  mockKeyframeEffect();
  mockAnimationPlaybackEvent();
  mockDocumentTimeline();

  if (typeof Animation === 'undefined') {
    Object.defineProperty(window, 'Animation', {
      writable: true,
      configurable: true,
      value: MockedAnimation,
    });
  }
}

export { MockedAnimation, mockAnimation };
