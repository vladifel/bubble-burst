import { describe, expect, it } from 'vitest';
import {
  DESKTOP_GRID,
  GRID_COLS,
  GRID_ROWS,
  isGridCleared,
  populateGrid,
  registerPop,
  updateComboDecay,
} from '../../src/client/engine/grid';
import { createInitialState } from '../../src/client/state';

describe('engine/grid', () => {
  it('creates a full intact grid', () => {
    const state = createInitialState();
    populateGrid(state, DESKTOP_GRID);
    expect(state.session.bubbles.size).toBe(GRID_ROWS * GRID_COLS);
    expect(state.session.gridCols).toBe(DESKTOP_GRID.cols);
    expect(isGridCleared(state)).toBe(false);
  });

  it('detects when all bubbles are popped', () => {
    const state = createInitialState();
    populateGrid(state, DESKTOP_GRID);
    for (const bubble of state.session.bubbles.values()) {
      bubble.popped = true;
      bubble.type = 'popped';
    }
    expect(isGridCleared(state)).toBe(true);
  });

  it('chains blitz combos inside the combo window', () => {
    const state = createInitialState();
    state.activeMode = 'BLITZ';

    registerPop(state, 1000);
    registerPop(state, 1201);
    registerPop(state, 1350);

    expect(state.session.comboMultiplier).toBe(2);
    expect(state.session.score).toBe(5);
    expect(state.session.maxCombo).toBe(2);
  });

  it('resets combo after the chain window expires', () => {
    const state = createInitialState();
    state.activeMode = 'BLITZ';

    registerPop(state, 1000);
    registerPop(state, 1100);
    updateComboDecay(state, 1400);

    expect(state.session.comboMultiplier).toBe(1);
  });

  it('limits combo ramp with step cooldown', () => {
    const state = createInitialState();
    state.activeMode = 'BLITZ';

    registerPop(state, 1000);
    registerPop(state, 1050);
    registerPop(state, 1100);

    expect(state.session.comboMultiplier).toBe(2);
  });

  it('tracks zen pops without score multipliers', () => {
    const state = createInitialState();
    state.activeMode = 'ZEN';

    registerPop(state, 500);
    registerPop(state, 700);

    expect(state.session.popsThisSession).toBe(2);
    expect(state.session.score).toBe(0);
  });
});
