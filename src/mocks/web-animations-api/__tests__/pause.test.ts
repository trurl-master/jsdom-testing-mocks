import { framesToTime, playAnimation, FRAME_DURATION } from '../../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

runner.useFakeTimers();

describe('Animation', () => {
  beforeEach(async () => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    await runner.advanceTimersByTime(syncShift);
  });

  describe('pause', () => {
    test('during before', async () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        {
          duration: 200,
          fill: 'forwards',
          delay: 100,
        }
      );

      const animation = new Animation(effect);

      await playAnimation(animation);

      await runner.advanceTimersByTime(50);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBeLessThan(300);

      await runner.advanceTimersByTime(50);

      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBeLessThan(300);

      await playAnimation(animation);

      expect(animation.playState).toBe('running');

      await runner.advanceTimersByTime(50);

      expect(animation.currentTime).toBeLessThan(300);

      await runner.advanceTimersByTime(200 + framesToTime(1));

      await animation.finished;
      expect(animation.playState).toBe('finished');
      expect(animation.currentTime).toEqual(300);
    });

    test('during active', async () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        {
          duration: 200,
          fill: 'forwards',
          delay: 100,
        }
      );

      const animation = new Animation(effect);

      await playAnimation(animation);

      await runner.advanceTimersByTime(150);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBeLessThan(300);

      await runner.advanceTimersByTime(50);

      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBeLessThan(300);

      await playAnimation(animation);

      expect(animation.playState).toBe('running');

      await runner.advanceTimersByTime(200);

      await animation.finished;

      expect(animation.currentTime).toBe(300);
    });

    test('during after', async () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        {
          duration: 200,
          fill: 'forwards',
          delay: 100,
          endDelay: 100,
        }
      );

      const animation = new Animation(effect);

      await playAnimation(animation);

      await runner.advanceTimersByTime(350);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBeLessThan(400);

      await runner.advanceTimersByTime(50);

      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBeLessThan(400);

      await playAnimation(animation);

      expect(animation.playState).toBe('running');

      await runner.advanceTimersByTime(200);

      await animation.finished;
      expect(animation.playState).toBe('finished');
      expect(animation.currentTime).toEqual(400);
    });
  });
});
