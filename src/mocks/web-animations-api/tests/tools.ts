async function playAnimation(animation: Animation) {
  animation.play();
  jest.advanceTimersByTime(0);
  await expect(animation.ready);
}

async function playAnimationInReverse(animation: Animation) {
  animation.reverse();
  jest.advanceTimersByTime(0);
  await expect(animation.ready);
}

async function updateAnimationPlaybackRate(animation: Animation, rate: number) {
  animation.updatePlaybackRate(rate);
  jest.advanceTimersByTime(0);
  await expect(animation.ready);
}

// https://github.com/sinonjs/fake-timers/blob/3a77a0978eaccd73ccc87dd42204b54e2bac0f6f/src/fake-timers-src.js#L1066
const FRAME_DURATION = 16;

function framesToTime(frames: number) {
  return frames * FRAME_DURATION;
}

export {
  playAnimation,
  playAnimationInReverse,
  updateAnimationPlaybackRate,
  FRAME_DURATION,
  framesToTime,
};
