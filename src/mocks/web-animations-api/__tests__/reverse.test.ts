import {
  framesToTime,
  playAnimation,
  playAnimationInReverse,
  updateAnimationPlaybackRate,
  FRAME_DURATION,
} from '../testTools';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

jest.useFakeTimers();

describe('Animation', () => {
  beforeEach(() => {
    const syncShift = FRAME_DURATION - (performance.now() % FRAME_DURATION);

    jest.advanceTimersByTime(syncShift);
  });

  describe('reverse', () => {
    describe('normal', () => {
      test('during active', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(75px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: framesToTime(6) }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimation(animation);

        expect(element.style.transform).toBe('translateX(50px)');

        // -> half way |
        jest.advanceTimersByTime(framesToTime(3));

        expect(element.style.transform).toBe('translateX(75px)');

        // half way -> back to start |
        await playAnimationInReverse(animation);

        await animation.ready;

        jest.advanceTimersByTime(framesToTime(3) - 1);

        expect(element.style.transform).toBe('translateX(50px)');

        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      test('by setting playbackRatio', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(75px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: framesToTime(6) }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimation(animation);

        expect(element.style.transform).toBe('translateX(50px)');

        // -> half way |
        jest.advanceTimersByTime(framesToTime(3));

        expect(element.style.transform).toBe('translateX(75px)');

        // half way -> back to start |
        animation.playbackRate = -animation.playbackRate;

        jest.advanceTimersByTime(framesToTime(3) - 1);

        expect(element.style.transform).toBe('translateX(50px)');

        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      test('by calling updatePlaybackRate', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(75px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: framesToTime(6) }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimation(animation);

        expect(element.style.transform).toBe('translateX(50px)');

        // -> half way |
        jest.advanceTimersByTime(framesToTime(3));

        expect(element.style.transform).toBe('translateX(75px)');

        // half way -> back to start |
        await updateAnimationPlaybackRate(animation, -1);

        jest.advanceTimersByTime(framesToTime(3) - 1);

        expect(element.style.transform).toBe('translateX(50px)');

        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });
    });

    describe('reversed', () => {
      test('during active', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(75px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: framesToTime(6) }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimationInReverse(animation);

        expect(element.style.transform).toBe('translateX(100px)');

        // -> half way |
        jest.advanceTimersByTime(framesToTime(3));

        expect(element.style.transform).toBe('translateX(75px)');

        // half way -> back to start |
        await playAnimationInReverse(animation);

        jest.advanceTimersByTime(framesToTime(3) - 1);

        expect(element.style.transform).toBe('translateX(100px)');

        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      test('by setting playbackRatio', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(75px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: framesToTime(6) }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimationInReverse(animation);

        expect(element.style.transform).toBe('translateX(100px)');

        // -> half way |
        jest.advanceTimersByTime(framesToTime(3));

        expect(element.style.transform).toBe('translateX(75px)');

        // half way -> back to start |
        animation.playbackRate = -animation.playbackRate;

        jest.advanceTimersByTime(framesToTime(3) - 1);

        expect(element.style.transform).toBe('translateX(100px)');

        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      test('by calling updatePlaybackRate', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(75px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: framesToTime(6) }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimationInReverse(animation);

        expect(element.style.transform).toBe('translateX(100px)');

        // -> half way |
        jest.advanceTimersByTime(framesToTime(3));

        expect(element.style.transform).toBe('translateX(75px)');

        // half way -> back to start |
        await updateAnimationPlaybackRate(animation, 1);

        jest.advanceTimersByTime(framesToTime(3) - 1);

        expect(element.style.transform).toBe('translateX(100px)');

        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });
    });
  });
});
