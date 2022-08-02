import { playAnimation, FRAME_DURATION } from '../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

jest.useFakeTimers();

describe('Animation', () => {
  beforeEach(() => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    jest.advanceTimersByTime(syncShift);
  });

  describe('events', () => {
    it('should fire finish events', async () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        { transform: 'translateX(0)' },
        100
      );

      const animation = new Animation(effect);

      const onfinish = jest.fn();

      animation.onfinish = onfinish;
      animation.addEventListener('finish', onfinish);

      await playAnimation(animation);

      jest.advanceTimersByTime(150);

      await expect(animation.finished).resolves.toBeInstanceOf(Animation);

      expect(onfinish).toHaveBeenCalledTimes(2);
    });

    it('should fire cancel events', (done) => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        { transform: 'translateX(0)' },
        100
      );

      const animation = new Animation(effect);

      const oncancel = jest.fn();

      animation.oncancel = oncancel;
      animation.addEventListener('cancel', oncancel);

      animation.play();

      animation.finished.catch(() => {
        expect(oncancel).toHaveBeenCalledTimes(2);
        done();
      });

      jest.advanceTimersByTime(50);

      animation.cancel();
    });
  });
});
