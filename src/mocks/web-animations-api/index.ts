import { mockAnimation } from './Animation';

const elementAnimations = new Map<Element, Animation[]>();

function removeFromAnimations(element: Element, animation: Animation) {
  const animations = elementAnimations.get(element);

  if (animations) {
    const index = animations.indexOf(animation);

    if (index !== -1) {
      animations.splice(index, 1);
    }
  }
}

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

  const animations = elementAnimations.get(this) ?? [];

  animations.push(animation);

  elementAnimations.set(this, animations);

  animation.addEventListener('finish', () =>
    removeFromAnimations(this, animation)
  );
  animation.addEventListener('cancel', () =>
    removeFromAnimations(this, animation)
  );

  animation.play();

  return animation;
}

function getAnimations(this: Element) {
  return elementAnimations.get(this) ?? [];
}

function getAllAnimations() {
  return Array.from(elementAnimations.values()).flat();
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

  afterEach(() => {
    elementAnimations.clear();
  });

  afterAll(() => {
    Element.prototype.animate = savedAnimate;
    Element.prototype.getAnimations = savedGetAnimations;
    Document.prototype.getAnimations = savedGetAllAnimations;
  });
}

export { mockAnimationsApi };
