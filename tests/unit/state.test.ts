import { describe, expect, it } from 'vitest';
import { createInitialState, resetSession } from '../../src/client/state';

describe('state', () => {
  it('creates a boot-ready initial state', () => {
    const state = createInitialState();
    expect(state.route).toBe('BOOT');
    expect(state.activeMode).toBeNull();
    expect(state.settings.haptics).toBe(true);
    expect(state.session.bubbles.size).toBe(0);
  });

  it('resets session fields without touching profile data', () => {
    const state = createInitialState();
    state.username = 'spez';
    state.lifetimePops = 999;
    state.session.score = 500;
    state.session.popsThisSession = 40;

    resetSession(state);

    expect(state.username).toBe('spez');
    expect(state.lifetimePops).toBe(999);
    expect(state.session.score).toBe(0);
    expect(state.session.popsThisSession).toBe(0);
    expect(state.session.maxCombo).toBe(1);
  });
});
