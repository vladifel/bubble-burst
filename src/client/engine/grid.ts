import type { UiState } from '../state';

export type GridDimensions = {
  cols: number;
  rows: number;
};

export const MOBILE_GRID: GridDimensions = { cols: 5, rows: 5 };
export const DESKTOP_GRID: GridDimensions = { cols: 6, rows: 6 };

/** @deprecated Use getGridDimensions() — kept for tests defaulting to desktop. */
export const GRID_COLS = DESKTOP_GRID.cols;
/** @deprecated Use getGridDimensions() — kept for tests defaulting to desktop. */
export const GRID_ROWS = DESKTOP_GRID.rows;

export const COMBO_WINDOW_MS = 280;
export const COMBO_STEP_COOLDOWN_MS = 200;
export const MAX_COMBO = 10;

export function getGridDimensions(): GridDimensions {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
    return MOBILE_GRID;
  }
  return DESKTOP_GRID;
}

export function bubbleId(row: number, col: number): string {
  return `${row}-${col}`;
}

export function populateGrid(state: UiState, dims: GridDimensions = getGridDimensions()): void {
  state.session.gridCols = dims.cols;
  state.session.gridRows = dims.rows;
  state.session.bubbles.clear();

  for (let row = 0; row < dims.rows; row += 1) {
    for (let col = 0; col < dims.cols; col += 1) {
      state.session.bubbles.set(bubbleId(row, col), {
        popped: false,
        type: 'intact',
      });
    }
  }
}

export function isGridCleared(state: UiState): boolean {
  for (const bubble of state.session.bubbles.values()) {
    if (!bubble.popped) return false;
  }
  return true;
}

export function registerPop(state: UiState, now: number): number {
  const { session } = state;
  session.popsThisSession += 1;

  const gap = session.lastPopAt ? now - session.lastPopAt : Infinity;

  if (gap > COMBO_WINDOW_MS) {
    session.comboMultiplier = 1;
  } else if (
    gap <= COMBO_WINDOW_MS &&
    now - session.lastComboIncreaseAt >= COMBO_STEP_COOLDOWN_MS
  ) {
    session.comboMultiplier = Math.min(MAX_COMBO, session.comboMultiplier + 1);
    session.lastComboIncreaseAt = now;
  }

  session.lastPopAt = now;

  if (state.activeMode === 'BLITZ') {
    session.score += session.comboMultiplier;
    session.maxCombo = Math.max(session.maxCombo, session.comboMultiplier);
    return session.comboMultiplier;
  }

  return 1;
}

export function updateComboDecay(state: UiState, now: number): void {
  if (
    state.activeMode === 'BLITZ' &&
    state.session.lastPopAt > 0 &&
    now - state.session.lastPopAt > COMBO_WINDOW_MS &&
    state.session.comboMultiplier > 1
  ) {
    state.session.comboMultiplier = 1;
  }
}
