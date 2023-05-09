import { playAnimation, FRAME_DURATION } from '../../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

runner.useFakeTimers();

describe('Animation', () => {
  beforeEach(async () => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    await runner.advanceTimersByTime(syncShift);
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

      const onfinish = runner.fn();

      animation.onfinish = onfinish;
      animation.addEventListener('finish', onfinish);

      await playAnimation(animation);

      await runner.advanceTimersByTime(150);

      await expect(animation.finished).resolves.toBeInstanceOf(Animation);

      expect(onfinish).toHaveBeenCalledTimes(2);
    });

    it('should fire cancel events', async () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        { transform: 'translateX(0)' },
        100
      );

      const animation = new Animation(effect);

      const oncancel = runner.fn();

      animation.oncancel = oncancel;
      animation.addEventListener('cancel', oncancel);

      animation.play();

      await runner.advanceTimersByTime(50);

      animation.cancel();

      expect(oncancel).toHaveBeenCalledTimes(2);
    });
  });
});
