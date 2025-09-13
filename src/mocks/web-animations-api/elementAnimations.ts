const elementAnimations = new Map<Element, Animation[]>();

export function removeAnimation(element: Element, animation: Animation) {
  const animations = elementAnimations.get(element);

  if (animations) {
    const index = animations.indexOf(animation);

    if (index !== -1) {
      animations.splice(index, 1);
    }
  }
}

export function addAnimation(element: Element, animation: Animation) {
  const animations = elementAnimations.get(element) ?? [];
  animations.push(animation);

  elementAnimations.set(element, animations);
}

export function getAnimations(this: Element) {
  return elementAnimations.get(this) ?? [];
}

export function getAllAnimations() {
  return Array.from(elementAnimations.values()).flat();
}

export function clearAnimations() {
  // Cancel all running animations to prevent requestAnimationFrame errors during teardown
  const allAnimations = getAllAnimations();
  allAnimations.forEach((animation) => {
    // Cancel the animation properly - this stops the requestAnimationFrame loop
    animation.cancel();
  });

  elementAnimations.clear();
}
