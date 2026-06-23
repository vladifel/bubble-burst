import type { UiState } from '../state';

export type BlitzTickHandler = (timeRemainingMs: number) => void;
export type BlitzEndHandler = () => void;

export type BlitzTimerControls = {
  stop: () => void;
  pause: () => void;
  resume: () => void;
};

const BLITZ_DURATION_MS = 60_000;

export function startBlitzTimer(
  state: UiState,
  onTick: BlitzTickHandler,
  onEnd: BlitzEndHandler
): BlitzTimerControls {
  state.session.timeRemaining = BLITZ_DURATION_MS;
  let lastFrame = performance.now();
  let rafId = 0;
  let running = true;
  let paused = false;

  const tick = (now: number): void => {
    if (!running) return;
    if (!paused) {
      const delta = now - lastFrame;
      state.session.timeRemaining = Math.max(0, state.session.timeRemaining - delta);
      onTick(state.session.timeRemaining);

      if (state.session.timeRemaining <= 0) {
        running = false;
        onEnd();
        return;
      }
    }
    lastFrame = now;
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return {
    stop: () => {
      running = false;
      cancelAnimationFrame(rafId);
    },
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
      lastFrame = performance.now();
    },
  };
}
