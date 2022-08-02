import { mockAnimationsApi } from '../index';

mockAnimationsApi();

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
});
