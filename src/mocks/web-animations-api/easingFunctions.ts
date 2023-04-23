import BezierEasing from 'bezier-easing';

const ease = BezierEasing(0.25, 0.1, 0.25, 1.0);
const easeIn = BezierEasing(0.42, 0.0, 1.0, 1.0);
const easeOut = BezierEasing(0.0, 0.0, 0.58, 1.0);
const easeInOut = BezierEasing(0.42, 0.0, 0.58, 1.0);

const VALID_JUMPTERMS = [
  'jump-start',
  'jump-end',
  'jump-none',
  'jump-both',
  'start',
  'end',
];

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * @param easing - string like "steps(4, end)"
 * @returns easing function
 */
export const StepsEasing = (easing: string) => {
  switch (easing) {
    case 'step-start':
      easing = 'steps(1, jump-start)';
      break;
    case 'step-end':
      easing = 'steps(1, jump-end)';
      break;
  }

  const easingString = easing.replace('steps(', '').replace(')', '');
  const easingArray = easingString.split(',').map((step) => step.trim());
  const [nString, jumpterm = 'jump-end'] = easingArray;

  const n = Number(nString);

  if (
    isNaN(n) ||
    !Number.isInteger(n) ||
    n <= 0 ||
    !VALID_JUMPTERMS.includes(jumpterm)
  ) {
    throw new Error(`Invalid easing function: ${easing}`);
  }

  switch (jumpterm) {
    case 'start':
    case 'jump-start':
      return (value: number) => {
        const step = Math.ceil(value * n);
        return clamp(step / n);
      };

    case 'end':
    case 'jump-end':
      return (value: number) => {
        const step = Math.floor(value * n);
        return clamp(step / n);
      };

    case 'jump-none':
      return (value: number) => {
        const step = Math.floor(value * n);
        return clamp(step / (n - 1));
      };

    case 'jump-both':
      return (value: number) => {
        if (value === 1) {
          return 1;
        }

        const step = Math.ceil(value * n);
        return clamp(step / (n + 1));
      };
  }

  throw new Error(`Invalid easing function: ${easing}`);
};

// easing functions
const easingFunctions: {
  [key: string]: (value: number, before: boolean) => number;
} = {
  linear: (value) => value,
  ease,
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
    easingFunctions[easing] = StepsEasing(easing);

    return easingFunctions[easing];
  }

  throw new Error(`Unknown easing function "${easing}"`);
}

export { getEasingFunctionFromString, easingFunctions };
