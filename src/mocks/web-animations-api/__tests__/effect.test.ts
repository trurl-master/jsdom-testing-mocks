import { playAnimation, FRAME_DURATION } from '../../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

runner.useFakeTimers();

describe('Animation', () => {
  beforeEach(async () => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    await runner.advanceTimersByTime(syncShift);
  });

  describe('effect', () => {
    it('should calculate computed timing', () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        {
          duration: 3000,
          fill: 'forwards',
          iterations: 2,
          delay: 100,
          endDelay: 300,
        }
      );
      const animation = new Animation(effect);

      expect(animation.effect?.getComputedTiming()).toEqual({
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

    describe('should calculate localTime and progress correctly', () => {
      it('when just created', () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
          {
            duration: 3000,
            fill: 'forwards',
            iterations: 2,
            delay: 100,
            endDelay: 300,
          }
        );
        const animation = new Animation(effect);

        expect(animation.effect?.getComputedTiming()).toEqual(
          expect.objectContaining({
            localTime: null,
            progress: null,
          })
        );
      });

      it('when running', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
          {
            duration: 200,
            fill: 'forwards',
            iterations: 2,
            delay: 100,
          }
        );

        const animation = new Animation(effect);

        await playAnimation(animation);

        await runner.advanceTimersByTime(50);

        expect(animation.currentTime).toBe(50);
        expect(animation.effect?.getComputedTiming().localTime).toBe(50);

        await runner.advanceTimersByTime(50);

        expect(animation.currentTime).toBe(100);

        // first iteration starts, progress should be 0, localTime should be equal to "delay"
        expect(animation.effect?.getComputedTiming().progress).toBeCloseTo(
          0,
          1
        );
        expect(animation.effect?.getComputedTiming().localTime).toBe(100);

        // 100ms after that we're still in the first iteration
        // progress should be 0.5, localTime should be equal to "delay" + "duration" / 2
        await runner.advanceTimersByTime(100);

        expect(animation.effect?.getComputedTiming().progress).toBeCloseTo(
          0.5,
          1
        );
        expect(animation.effect?.getComputedTiming().localTime).toBe(200);

        // 200ms after that we're in the middle of the second iteration
        // progress should be 0.5, localTime should be "delay" + "duration" + "duration" / 2
        await runner.advanceTimersByTime(200);

        expect(animation.effect?.getComputedTiming().progress).toBeCloseTo(
          0.5,
          1
        );
        expect(animation.effect?.getComputedTiming().localTime).toBe(400);

        await runner.advanceTimersByTime(200);

        await animation.finished;

        expect(animation.currentTime).toBe(500);
      });
    });
  });
});
