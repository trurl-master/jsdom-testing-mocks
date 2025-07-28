import { MockedAnimation } from '../Animation';
import { mockAnimationsApi } from '../index';

mockAnimationsApi();

runner.useFakeTimers();

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

  describe('finish', () => {
    it('throws an InvalidStateError when finishing an infinite animation', () => {
      const element = document.createElement('div');

      const effect = new KeyframeEffect(
        element,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
        { duration: 100, iterations: Infinity }
      );

      const animation = new Animation(effect);

      expect(() => animation.finish()).toThrow(
        "Failed to execute 'finish' on 'Animation': Cannot finish Animation with an infinite target effect end."
      );
    });
  });
});
