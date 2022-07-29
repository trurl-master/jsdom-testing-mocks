import BezierEasing from 'bezier-easing';

const ease = BezierEasing(0.25, 0.1, 0.25, 1.0);
const easeIn = BezierEasing(0.42, 0.0, 1.0, 1.0);
const easeOut = BezierEasing(0.0, 0.0, 0.58, 1.0);
const easeInOut = BezierEasing(0.42, 0.0, 0.58, 1.0);

// easing functions
const easingFunctions: {
  [key: string]: (value: number, before: boolean) => number;
} = {
  linear: (value) => value,
  ease: ease,
  'ease-in': easeIn,
  'ease-out': easeOut,
  'ease-in-out': easeInOut,
};

function getEasingFunctionFromString(easing: string) {
  if (easingFunctions[easing]) {
    return easingFunctions[easing];
  }

  // convert "cubic-bezier(x1, y1, x2, y2)" string to bezier easing function
  if (easing.indexOf('cubic-bezier(') === 0) {
    const bezierString = easing.replace('cubic-bezier(', '').replace(')', '');
    const bezierArray = bezierString.split(',').map(Number);
    easingFunctions[easing] = BezierEasing(
      bezierArray[0],
      bezierArray[1],
      bezierArray[2],
      bezierArray[3]
    );

    return easingFunctions[easing];
  }

  // convert "steps(x)" string
  if (easing.indexOf('steps(') === 0) {
    throw new Error('steps() is not implemented yet');
  }

  throw new Error(`Unknown easing function "${easing}"`);
}

export { getEasingFunctionFromString, easingFunctions };
