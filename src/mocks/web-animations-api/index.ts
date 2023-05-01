import { mockAnimation } from './Animation';
import {
  getAnimations,
  getAllAnimations,
  clearAnimations,
} from './elementAnimations';
import { getConfig } from '../../tools';

const config = getConfig();

function animate(
  this: Element,
  keyframes: Keyframe[],
  options?: number | KeyframeAnimationOptions
) {
  const keyframeEffect = new KeyframeEffect(this, keyframes, options);

  const animation = new Animation(keyframeEffect);
  if (typeof options == 'object' && options.id) {
    animation.id = options.id;
  }

  animation.play();

  return animation;
}

function mockAnimationsApi() {
  const savedAnimate = Element.prototype.animate;
  const savedGetAnimations = Element.prototype.getAnimations;
  const savedGetAllAnimations = Document.prototype.getAnimations;

  mockAnimation();

  Object.defineProperties(Element.prototype, {
    animate: {
      writable: true,
      configurable: true,
      value: animate,
    },
    getAnimations: {
      writable: true,
      configurable: true,
      value: getAnimations,
    },
  });

  Object.defineProperty(Document.prototype, 'getAnimations', {
    writable: true,
    configurable: true,
    value: getAllAnimations,
  });

  config.afterEach(() => {
    clearAnimations();
  });

  config.afterAll(() => {
    Element.prototype.animate = savedAnimate;
    Element.prototype.getAnimations = savedGetAnimations;
    Document.prototype.getAnimations = savedGetAllAnimations;
  });
}

export { mockAnimationsApi };
