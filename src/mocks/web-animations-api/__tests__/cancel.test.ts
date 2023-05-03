import {
  playAnimation,
  FRAME_DURATION,
  framesToTime,
  wait,
} from '../../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

describe('Animation', () => {
  describe('real timers', () => {
    describe('cancel', () => {
      it('it doesn\'t cancel if state is "idle"', () => {
        runner.useRealTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          200
        );

        const animation = new Animation(effect);

        const finishedPromise = animation.finished;

        animation.cancel();

        expect(finishedPromise === animation.finished).toBe(true);
      });

      it("it cancels a running animation, but doesn't throw", async () => {
        runner.useRealTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          framesToTime(10)
        );

        const animation = new Animation(effect);

        animation.play();

        const finishedPromise = animation.finished;

        await wait(framesToTime(3));

        animation.cancel();

        await wait(framesToTime(5));

        expect(finishedPromise).not.toBe(animation.finished);
      });

      it('rejects the finished promise with an error, if state is "running"', async () => {
        runner.useRealTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          200
        );

        const animation = new Animation(effect);

        animation.play();

        await animation.ready;

        const initialFinishedPromise = animation.finished;

        const result = animation.finished.catch((error: unknown) => {
          expect(error).toBeInstanceOf(DOMException);

          if (error instanceof DOMException) {
            expect(error.name).toBe('AbortError');
            expect(error.message).toEqual('The user aborted a request.');
          }

          expect(animation.playState).toBe('idle');
          expect(animation.currentTime).toBeNull();
          expect(animation.finished !== initialFinishedPromise).toBe(true);
        });

        animation.cancel();

        return result;
      });
    });
  });

  describe('fake timers', () => {
    beforeEach(async () => {
      runner.useFakeTimers();

      const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

      await runner.advanceTimersByTime(syncShift);
    });

    describe('cancel', () => {
      it('it doesn\'t cancel if state is "idle"', () => {
        runner.useFakeTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          200
        );

        const animation = new Animation(effect);

        const finishedPromise = animation.finished;

        animation.cancel();

        expect(finishedPromise === animation.finished).toBe(true);
      });

      it("it cancels a running animation, but doesn't throw", async () => {
        runner.useFakeTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          framesToTime(10)
        );

        const animation = new Animation(effect);

        await playAnimation(animation);

        await runner.advanceTimersByTime(framesToTime(3));

        const finishedPromise = animation.finished;
        animation.cancel();
        await runner.advanceTimersByTime(framesToTime(3));

        expect(finishedPromise).not.toBe(animation.finished);
      });

      it('rejects the finished promise with an error, if state is "running"', async () => {
        runner.useFakeTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          200
        );

        const animation = new Animation(effect);

        await playAnimation(animation);

        await animation.ready;

        const initialFinishedPromise = animation.finished;

        const result = animation.finished.catch((error: unknown) => {
          expect(error).toBeInstanceOf(DOMException);

          if (error instanceof DOMException) {
            expect(error.name).toBe('AbortError');
            expect(error.message).toEqual('The user aborted a request.');
          }

          expect(animation.playState).toBe('idle');
          expect(animation.currentTime).toBeNull();
          expect(animation.finished !== initialFinishedPromise).toBe(true);
        });

        animation.cancel();

        return result;
      });
    });
  });
});
