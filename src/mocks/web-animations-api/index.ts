import { mockAnimation } from './Animation';
import {
  getAnimations,
  getAllAnimations,
  clearAnimations,
} from './elementAnimations';
import { mockScrollTimeline } from './ScrollTimeline';
import { mockViewTimeline } from './ViewTimeline';
import { getConfig } from '../../tools';
import { isJsdomEnv, WrongEnvironmentError } from '../../helper';

const config = getConfig();

function animate(
  this: Element,
  keyframes: Keyframe[],
  options?: number | KeyframeAnimationOptions
) {
  const keyframeEffect = new KeyframeEffect(this, keyframes, options);

  // Extract timeline from options if provided
  const timeline = typeof options === 'object' && options.timeline ? options.timeline : document.timeline;
  const animation = new Animation(keyframeEffect, timeline);
  
  if (typeof options == 'object' && options.id) {
    animation.id = options.id;
  }

  animation.play();

  return animation;
}

function mockAnimationsApi() {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  const savedAnimate = Element.prototype.animate;
  const savedGetAnimations = Element.prototype.getAnimations;
  const savedGetAllAnimations = Document.prototype.getAnimations;

  mockAnimation();
  mockScrollTimeline();
  mockViewTimeline();

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

function mockScrollTimelines() {
  if (!isJsdomEnv()) {
    throw new WrongEnvironmentError();
  }

  mockScrollTimeline();
  mockViewTimeline();
}

export { mockAnimationsApi, mockScrollTimelines };
export { MockedScrollTimeline, mockScrollTimeline } from './ScrollTimeline';
export { MockedViewTimeline, mockViewTimeline } from './ViewTimeline';
