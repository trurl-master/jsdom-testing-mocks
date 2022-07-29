import './AnimationTimeline';

describe('AnimationTimeline', () => {
  it('should be defined', () => {
    expect(AnimationTimeline).toBeDefined();
  });

  it('should throw "TypeError: Illegal constructor" if instantiated directly', () => {
    expect(() => {
      new AnimationTimeline();
    }).toThrow(TypeError);
    expect(() => {
      new AnimationTimeline();
    }).toThrow('Illegal constructor');
  });
});
