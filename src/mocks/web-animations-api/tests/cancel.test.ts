import { playAnimation, FRAME_DURATION } from './tools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

jest.useFakeTimers();

describe('Animation', () => {
  beforeEach(() => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    jest.advanceTimersByTime(syncShift);
  });

  describe('cancel', () => {
    it('it doesn\'t cancel if state is "idle"', () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        { transform: 'translateX(100px)' },
        200
      );

      const animation = new Animation(effect);

      const finishedPromise = animation.finished;

      animation.cancel();
      // animation.play();

      // expect(animation.playState).toBe('running');
      expect(finishedPromise === animation.finished).toBe(true);
    });

    it('rejects the finished promise with an error, if state is "running"', (done) => {
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
