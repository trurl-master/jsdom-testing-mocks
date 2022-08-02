import {
  framesToTime,
  playAnimation,
  playAnimationInReverse,
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

  describe('commitStyles', () => {
    const DELAY = framesToTime(6);
    const DURATION = framesToTime(6);
    const END_DELAY = framesToTime(6);

    describe('normal', () => {
      it('no delays, 1 keyframe', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          { duration: DURATION }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimation(animation);

        expect(element.style.transform).toBe('');

        // -> active |
        jest.advanceTimersByTime(DURATION - 1);

        // console.log('-> active |', animation.currentTime, performance.now());

        expect(element.style.transform).toBe('translateX(100px)');

        // | finished
        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      it('no delays, 2 keyframes', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: DURATION }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimation(animation);

        expect(element.style.transform).toBe('translateX(50px)');

        // -> active |
        jest.advanceTimersByTime(DURATION - 1);

        // console.log('-> active |', animation.currentTime, performance.now());

        expect(element.style.transform).toBe('translateX(100px)');

        // | finished
        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      describe('fill, 1 keyframe', () => {
        it('none', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              // fill defaults to "auto", which is "none"
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('');

          // console.log('advancing by', DURATION - 1, 'from', performance.now());

          // -> active |
          jest.advanceTimersByTime(DURATION - 1);

          // console.log('-> active |', animation.currentTime, performance.now());

          expect(element.style.transform).toBe('translateX(100px)');

          // | endDelay ->
          jest.advanceTimersByTime(1);

          // console.log('| endDelay ->', animation.currentTime, performance.now());

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('backwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'backwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('');

          // -> active |
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('forwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'forwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('');

          // -> active |
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          await animation.finished;

          expect(element.style.transform).toBe('translateX(100px)');
        });

        it('both', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'both',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          await animation.finished;

          expect(element.style.transform).toBe('translateX(100px)');
        });
      });

      describe('fill, 2+ keyframes', () => {
        it('none', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              // fill defaults to "auto", which is "none"
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> active |
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('backwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'backwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> active |
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('forwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'forwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          await animation.finished;

          expect(element.style.transform).toBe('translateX(100px)');
        });

        it('both', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'both',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimation(animation);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> active |
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(100px)');

          // | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          await animation.finished;

          expect(element.style.transform).toBe('translateX(100px)');
        });
      });
    });

    describe('reversed', () => {
      it('no delays, 1 keyframe', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          { duration: DURATION }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimationInReverse(animation);

        expect(element.style.transform).toBe('translateX(100px)');

        // -> active |
        jest.advanceTimersByTime(DURATION - 1);

        expect(element.style.transform).toBe('');

        // | finished
        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      it('no delays, 2 keyframes', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [
            { transform: 'translateX(50px)' },
            { transform: 'translateX(100px)' },
          ],
          { duration: DURATION }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        // active ->
        await playAnimationInReverse(animation);

        expect(element.style.transform).toBe('translateX(100px)');

        // -> active |
        jest.advanceTimersByTime(DURATION - 1);

        expect(element.style.transform).toBe('translateX(50px)');

        // | finished
        jest.advanceTimersByTime(1);

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      describe('fill, 1 keyframe', () => {
        it('none', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              // fill defaults to "auto", which is "none"
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('backwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'backwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('forwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'forwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          // await playAnimation(animation);
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('both', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            { transform: 'translateX(100px)' },
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'both',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });
      });

      describe('fill, 2+ keyframes', () => {
        it('none', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              // fill defaults to "auto", which is "none"
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('backwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'backwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('translateX(50px)');

          await animation.finished;

          expect(element.style.transform).toBe('translateX(50px)');
        });

        it('forwards', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'forwards',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION - 1);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(1);

          expect(element.style.transform).toBe('');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('');

          await animation.finished;

          expect(element.style.transform).toBe('');
        });

        it('both', async () => {
          const element = document.createElement('div');

          const effect = new KeyframeEffect(
            element,
            [
              { transform: 'translateX(50px)' },
              { transform: 'translateX(100px)' },
            ],
            {
              delay: DELAY,
              duration: DURATION,
              endDelay: END_DELAY,
              fill: 'both',
            }
          );

          const animation = new Animation(effect);

          expect(element.style.transform).toBe('');

          // delay ->
          await playAnimationInReverse(animation);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> delay | active ->
          jest.advanceTimersByTime(DELAY);

          expect(element.style.transform).toBe('translateX(100px)');

          // -> active | endDelay ->
          jest.advanceTimersByTime(DURATION);

          expect(element.style.transform).toBe('translateX(50px)');

          // -> endDelay | finished ->
          jest.advanceTimersByTime(END_DELAY);

          expect(element.style.transform).toBe('translateX(50px)');

          await animation.finished;

          expect(element.style.transform).toBe('translateX(50px)');
        });
      });
    });
  });
});
