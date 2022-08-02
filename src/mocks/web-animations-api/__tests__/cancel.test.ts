import { playAnimation, FRAME_DURATION, framesToTime } from '../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

describe('Animation', () => {
  describe('real timers', () => {
    describe('cancel', () => {
      it('it doesn\'t cancel if state is "idle"', () => {
        jest.useRealTimers();

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

      it("it cancels a running animation, but doesn't throw", (done) => {
        jest.useRealTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          framesToTime(10)
        );

        const animation = new Animation(effect);

        animation.play();

        const finishedPromise = animation.finished;

        setTimeout(() => {
          animation.cancel();
        }, framesToTime(3));

        setTimeout(() => {
          expect(finishedPromise).not.toBe(animation.finished);
          done();
        }, framesToTime(5));
      });

      it('rejects the finished promise with an error, if state is "running"', (done) => {
        jest.useRealTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          200
        );

        const animation = new Animation(effect);

        animation.play();

        animation.ready.then(() => {
          const initialFinishedPromise = animation.finished;

          animation.finished.catch((error: unknown) => {
            expect(error).toBeInstanceOf(DOMException);

            if (error instanceof DOMException) {
              expect(error.name).toBe('AbortError');
              expect(error.message).toEqual('The user aborted a request.');
            }

            expect(animation.playState).toBe('idle');
            expect(animation.currentTime).toBeNull();
            expect(animation.finished !== initialFinishedPromise).toBe(true);

            done();
          });

          animation.cancel();
        });
      });
    });
  });

  describe('fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();

      const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

      jest.advanceTimersByTime(syncShift);
    });

    describe('cancel', () => {
      it('it doesn\'t cancel if state is "idle"', () => {
        jest.useFakeTimers();

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
        jest.useFakeTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          framesToTime(10)
        );

        const animation = new Animation(effect);

        await playAnimation(animation);

        jest.advanceTimersByTime(framesToTime(3));

        const finishedPromise = animation.finished;
        animation.cancel();
        jest.advanceTimersByTime(framesToTime(3));

        expect(finishedPromise).not.toBe(animation.finished);
      });

      it('rejects the finished promise with an error, if state is "running"', (done) => {
        jest.useFakeTimers();

        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          200
        );

        const animation = new Animation(effect);

        playAnimation(animation).then(() => {
          const initialFinishedPromise = animation.finished;

          animation.finished.catch((error: unknown) => {
            expect(error).toBeInstanceOf(DOMException);

            if (error instanceof DOMException) {
              expect(error.name).toBe('AbortError');
              expect(error.message).toEqual('The user aborted a request.');
            }

            expect(animation.playState).toBe('idle');
            expect(animation.currentTime).toBeNull();
            expect(animation.finished !== initialFinishedPromise).toBe(true);

            done();
          });

          animation.cancel();
        });
      });
    });
  });
});
