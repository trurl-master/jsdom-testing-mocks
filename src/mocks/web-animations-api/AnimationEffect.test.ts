import { mockAnimationEffect } from './AnimationEffect';

mockAnimationEffect();

describe('AnimationEffect', () => {
  it('should be defined', () => {
    expect(AnimationEffect).toBeDefined();
  });

  it('should throw "TypeError: Illegal constructor" if instantiated directly', () => {
    expect(() => {
      new AnimationEffect();
    }).toThrow(TypeError);
    expect(() => {
      new AnimationEffect();
    }).toThrow('Illegal constructor');
  });
});
