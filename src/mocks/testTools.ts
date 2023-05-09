async function playAnimation(animation: Animation) {
  animation.play();
  runner.advanceTimersByTime(0);
  await expect(animation.ready);
}

async function playAnimationInReverse(animation: Animation) {
  animation.reverse();
  runner.advanceTimersByTime(0);
  await expect(animation.ready);
}

async function updateAnimationPlaybackRate(animation: Animation, rate: number) {
  animation.updatePlaybackRate(rate);
  runner.advanceTimersByTime(0);
  await expect(animation.ready);
}

// https://github.com/sinonjs/fake-timers/blob/3a77a0978eaccd73ccc87dd42204b54e2bac0f6f/src/fake-timers-src.js#L1066
const FRAME_DURATION = 16;

function framesToTime(frames: number) {
  return frames * FRAME_DURATION;
}

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export {
  wait,
  playAnimation,
  playAnimationInReverse,
  updateAnimationPlaybackRate,
  FRAME_DURATION,
  framesToTime,
};
