import { framesToTime, playAnimation, FRAME_DURATION } from './tools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

jest.useFakeTimers();

describe('Animation', () => {
  beforeEach(() => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    jest.advanceTimersByTime(syncShift);
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

      jest.advanceTimersByTime(50);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toEqual(50);

      jest.advanceTimersByTime(50);

      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toEqual(50);

      await playAnimation(animation);

      expect(animation.playState).toBe('running');

      jest.advanceTimersByTime(50);

      expect(animation.currentTime).toEqual(100);

      jest.advanceTimersByTime(200 + framesToTime(1));

      expect(animation.playState).toBe('finished');

      await animation.finished;

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

      jest.advanceTimersByTime(150);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBe(150);

      jest.advanceTimersByTime(50);

      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBe(150);

      await playAnimation(animation);

      expect(animation.playState).toBe('running');

      jest.advanceTimersByTime(200);

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

      jest.advanceTimersByTime(350);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBe(350);

      jest.advanceTimersByTime(50);

      expect(animation.playState).toBe('paused');
      expect(animation.currentTime).toBe(350);

      await playAnimation(animation);

      expect(animation.playState).toBe('running');

      jest.advanceTimersByTime(200);

      await animation.finished;
    });
  });
});
