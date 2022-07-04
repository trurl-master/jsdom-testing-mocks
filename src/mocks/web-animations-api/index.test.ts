import { mockAnimationsApi } from './index';
import { expectTime } from './testHelpers';

const { setDurationMultiplier } = mockAnimationsApi();

describe('Animations API', () => {
  it('should be defined', () => {
    const element = document.createElement('div');

    expect(element.animate).toBeDefined();
    expect(element.getAnimations).toBeDefined();
    expect(document.getAnimations).toBeDefined();
  });

  test('.animate should create an animation and play it', () => {
    const element = document.createElement('div');

    const animation = element.animate({ opacity: 0 }, 1000);

    expect(animation).toBeInstanceOf(Animation);
    expect(animation.playState).toBe('running');
  });

  it('should add/delete an animation to/from element and document lists', async () => {
    const element = document.createElement('div');

    const animation = element.animate({ opacity: 0 }, 100);

    expect(element.getAnimations().length).toBe(1);
    expect(element.getAnimations()).toContain(animation);
    expect(document.getAnimations().length).toBe(1);
    expect(document.getAnimations()).toContain(animation);

    await animation.finished;

    expect(element.getAnimations().length).toBe(0);
    expect(document.getAnimations().length).toBe(0);
  });

  it('should set duration multiplier', async () => {
    // speed up animations 10 times
    setDurationMultiplier(0.1);

    const element = document.createElement('div');

    const timeBefore = performance.now();
    const animation = element.animate({ opacity: 0 }, 1000);

    await animation.finished;
    const timeAfter = performance.now();

    expectTime(timeAfter - timeBefore, 100);
    expectTime(animation.currentTime, 1000);
  });

  // this test should be run after the one that modifies the duration multiplier
  it('should set duration multiplier back to the global after each test', async () => {
    const element = document.createElement('div');

    const timeBefore = performance.now();
    const animation = element.animate({ opacity: 0 }, 1000);

    await animation.finished;
    const timeAfter = performance.now();

    expectTime(timeAfter - timeBefore, 1000);
    expectTime(animation.currentTime, 1000);
  });
});
