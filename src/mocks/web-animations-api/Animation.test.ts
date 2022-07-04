import { MockedAnimation } from './Animation';
import { expectTime, wait } from './testHelpers';

describe('Animation', () => {
  describe('constructor', () => {
    it('should be defined', () => {
      const animation = new Animation();

      expect(animation).toBeInstanceOf(MockedAnimation);
    });

    it('should have correct properties if no keyframe effect is provided', async () => {
      const animation = new Animation();

      expect(animation.currentTime).toBeNull();
      expect(animation.effect).toBeNull();
      expect(animation.finished).toBeInstanceOf(Promise);
      expect(animation.id).toBe('');
      expect(animation.oncancel).toBeNull();
      expect(animation.onfinish).toBeNull();
      expect(animation.onremove).toBeNull();
      expect(animation.pending).toBe(false);
      expect(animation.playState).toBe('idle');
      expect(animation.playbackRate).toBe(1);
      expect(await animation.ready).toBe(animation);
      expect(animation.replaceState).toBe('active');
      expect(animation.startTime).toBeNull();
      expect(animation.timeline).toBeInstanceOf(AnimationTimeline);
    });

    it('should have correct properties if finite keyframe effect is provided', async () => {
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

      expect(animation.currentTime).toBeNull();
      expect(animation.effect).toBe(effect);
      expect(animation.finished).toBeInstanceOf(Promise);
      expect(animation.id).toBe('');
      expect(animation.oncancel).toBeNull();
      expect(animation.onfinish).toBeNull();
      expect(animation.onremove).toBeNull();
      expect(animation.pending).toBe(false);
      expect(animation.playState).toBe('idle');
      expect(animation.playbackRate).toBe(1);
      expect(await animation.ready).toBe(animation);
      expect(animation.replaceState).toBe('active');
      expect(animation.startTime).toBeNull();
      expect(animation.timeline).toBeInstanceOf(AnimationTimeline);
    });
  });

  describe('currentTime', () => {
    it('should be null if no keyframe effect is provided', () => {
      const animation = new Animation();

      expect(animation.currentTime).toBeNull();
    });

    it('should be null if infinite keyframe effect is provided', async () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        { duration: 100, iterations: Infinity }
      );

      const animation = new Animation(effect);

      expect(animation.currentTime).toBeNull();
    });
  });

  describe('pause', () => {
    test('during delay', async () => {
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

      animation.play();

      await wait(50);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expectTime(animation.currentTime, 50);

      await wait(50);

      expect(animation.playState).toBe('paused');
      expectTime(animation.currentTime, 50);

      animation.play();
      expect(animation.playState).toBe('running');

      await wait(50);
      expectTime(animation.currentTime, 100);

      await animation.finished;

      expectTime(animation.currentTime, 300);
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

      animation.play();

      await wait(150);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expectTime(animation.currentTime, 150);

      await wait(50);

      expect(animation.playState).toBe('paused');
      expectTime(animation.currentTime, 150);

      animation.play();
      expect(animation.playState).toBe('running');

      await animation.finished;

      expectTime(animation.currentTime, 300);
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
          endDelay: 100,
        }
      );

      const animation = new Animation(effect);

      animation.play();

      await wait(350);

      animation.pause();
      expect(animation.playState).toBe('paused');
      expectTime(animation.currentTime, 350);

      await wait(50);

      expect(animation.playState).toBe('paused');
      expectTime(animation.currentTime, 350);

      animation.play();
      expect(animation.playState).toBe('running');

      await animation.finished;

      expectTime(animation.currentTime, 400);
    });
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
      animation.play();

      expect(animation.playState).toBe('running');
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

      animation.play();

      const initialFinishedPromise = animation.finished;

      animation.finished.catch((error: unknown) => {
        expect(error).toBeInstanceOf(Error);

        if (error instanceof Error) {
          expect(error.message).toEqual(
            'DOMException: The user aborted a request.'
          );
        }

        expect(animation.playState).toBe('idle');
        expect(animation.currentTime).toBeNull();
        expect(animation.finished !== initialFinishedPromise).toBe(true);

        done();
      });

      animation.cancel();
    });
  });

  describe('finish', () => {
    it('throws an InvalidStateError when finishing an infinite animation', () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        { duration: 100, iterations: Infinity }
      );

      const animation = new Animation(effect);

      expect(() => animation.finish()).toThrowError(
        "Failed to execute 'finish' on 'Animation': Cannot finish Animation with an infinite target effect end."
      );
    });
  });

  describe('commitStyles', () => {
    describe('fill, 1 keyframe', () => {
      it('none', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          { transform: 'translateX(100px)' },
          {
            delay: 100,
            duration: 100,
            endDelay: 100,
            // fill defaults to "auto", which is "none"
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('');

        await wait(50);

        expect(element.style.transform).toBe('');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('');

        // active -> endDelay
        await wait(100);

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
            delay: 100,
            duration: 100,
            endDelay: 100,
            fill: 'backwards',
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('');

        await wait(50);

        expect(element.style.transform).toBe('');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('');

        // active -> endDelay
        await wait(100);

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
            delay: 100,
            duration: 100,
            endDelay: 100,
            fill: 'forwards',
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('');

        await wait(50);

        expect(element.style.transform).toBe('');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('');

        // active -> endDelay
        await wait(100);

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
            delay: 100,
            duration: 100,
            endDelay: 100,
            fill: 'both',
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('');

        await wait(50);

        expect(element.style.transform).toBe('');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('');

        // active -> endDelay
        await wait(100);

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
          [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
          {
            delay: 100,
            duration: 100,
            endDelay: 100,
            // fill defaults to "auto", which is "none"
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('');

        await wait(50);

        expect(element.style.transform).toBe('');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('translateX(0)');

        // active -> endDelay
        await wait(100);

        expect(element.style.transform).toBe('');

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      it('backwards', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
          {
            delay: 100,
            duration: 100,
            endDelay: 100,
            fill: 'backwards',
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('translateX(0)');

        await wait(50);

        expect(element.style.transform).toBe('translateX(0)');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('translateX(0)');

        // active -> endDelay
        await wait(100);

        expect(element.style.transform).toBe('');

        await animation.finished;

        expect(element.style.transform).toBe('');
      });

      it('forwards', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
          {
            delay: 100,
            duration: 100,
            endDelay: 100,
            fill: 'forwards',
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('');

        await wait(50);

        expect(element.style.transform).toBe('');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('translateX(0)');

        // active -> endDelay
        await wait(100);

        expect(element.style.transform).toBe('translateX(100px)');

        await animation.finished;

        expect(element.style.transform).toBe('translateX(100px)');
      });

      it('both', async () => {
        const element = document.createElement('div');

        const effect = new KeyframeEffect(
          element,
          [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
          {
            delay: 100,
            duration: 100,
            endDelay: 100,
            fill: 'both',
          }
        );

        const animation = new Animation(effect);

        expect(element.style.transform).toBe('');

        animation.play();

        // delay
        expect(element.style.transform).toBe('translateX(0)');

        await wait(50);

        expect(element.style.transform).toBe('translateX(0)');

        // delay -> active
        await wait(100);

        expect(element.style.transform).toBe('translateX(0)');

        // active -> endDelay
        await wait(100);

        expect(element.style.transform).toBe('translateX(100px)');

        await animation.finished;

        expect(element.style.transform).toBe('translateX(100px)');
      });
    });
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

        animation.play();

        await wait(50);

        expectTime(animation.currentTime, 50);

        await wait(50);

        expectTime(animation.currentTime, 100);

        // first iteration starts, progress should be 0, localTime should be equal to "delay"
        expect(animation.effect?.getComputedTiming().progress).toBeCloseTo(
          0,
          1
        );
        expectTime(animation.effect?.getComputedTiming().localTime, 100);

        // 100ms after that we're still in the first iteration
        // progress should be 0.5, localTime should be equal to "delay" + "duration" / 2
        await wait(100);

        expect(animation.effect?.getComputedTiming().progress).toBeCloseTo(
          0.5,
          1
        );
        expectTime(animation.effect?.getComputedTiming().localTime, 200);

        // 200ms after that we're in the middle of the second iteration
        // progress should be 0.5, localTime should be "delay" + "duration" + "duration" / 2
        await wait(200);

        expect(animation.effect?.getComputedTiming().progress).toBeCloseTo(
          0.5,
          1
        );
        expectTime(animation.effect?.getComputedTiming().localTime, 400);

        await animation.finished;

        expectTime(animation.currentTime, 500);
      });
    });
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

      animation.play();

      await animation.finished;

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

      wait(50).then(() => {
        animation.cancel();
      });
    });
  });
});
