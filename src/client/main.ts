import { unlockAudio } from './audio';
import { fetchInitData, submitBlitzScore, syncLifetimePops } from './bridge';
import { clear, el } from './dom';
import { startBlitzTimer, type BlitzTimerControls } from './engine/blitz';
import { populateGrid, updateComboDecay } from './engine/grid';
import { attachPointerEngine } from './engine/pointer';
import { attachVisualStack, type VisualStack } from './engine/visual-stack';
import { renderGateScreen } from './screens/gate';
import { renderPlayingScreen } from './screens/playing';
import { renderResultsScreen } from './screens/results';
import { renderSettingsOverlay } from './screens/settings-overlay';
import { renderStatsScreen } from './screens/stats-screen';
import { createInitialState, pushActivity, resetSession } from './state';
import './styles/global.css';
import './styles/stitch.css';
import './styles/tokens.css';

const root = document.getElementById('app');
if (!root) {
  throw new Error('Missing #app root');
}
const app: HTMLElement = root;

const state = createInitialState();
let detachPointer: (() => void) | null = null;
let blitzTimer: BlitzTimerControls | null = null;
let comboRaf = 0;
let settingsOverlayEl: HTMLElement | null = null;
let playingMount: ReturnType<typeof renderPlayingScreen> | null = null;
let visualStack: VisualStack | null = null;
let exitingPlaying = false;
let settingsOpen = false;

function cleanupPlaying(): void {
  detachPointer?.();
  detachPointer = null;
  visualStack?.destroy();
  visualStack = null;
  blitzTimer?.stop();
  blitzTimer = null;
  cancelAnimationFrame(comboRaf);
  playingMount = null;
  hideSettings();
}

function hideSettings(): void {
  settingsOverlayEl?.remove();
  settingsOverlayEl = null;
  settingsOpen = false;
}

function showSettings(context: 'gate' | 'playing'): void {
  hideSettings();
  settingsOpen = true;
  blitzTimer?.pause();

  settingsOverlayEl = renderSettingsOverlay(state, context, {
    onToggleHaptics: (value) => {
      state.settings.haptics = value;
    },
    onToggleAudio: (value) => {
      state.settings.audio = value;
    },
    onClose: () => {
      hideSettings();
    },
    onResume: () => {
      hideSettings();
      blitzTimer?.resume();
    },
    onRestart: () => {
      hideSettings();
      void restartActiveMode();
    },
    onQuit: () => {
      hideSettings();
      void exitPlaying();
    },
  });

  app.append(settingsOverlayEl);
}

function render(): void {
  hideSettings();
  clear(app);
  switch (state.route) {
    case 'BOOT':
      renderBoot();
      break;
    case 'GATE':
      renderGate();
      break;
    case 'PLAYING':
      renderPlaying();
      break;
    case 'RESULTS':
      renderResults();
      break;
    case 'STATS':
      renderStats();
      break;
  }
}

function renderBoot(): void {
  app.append(
    el('section', { className: 'screen screen-boot' }, [
      el('div', { className: 'glass-panel boot-panel floating-bubble' }, [
        el('img', {
          className: 'hero-app-icon boot-icon',
          src: '/assets/icon.png',
          alt: '',
        }),
        el('h1', { className: 'gate-title neon-text-primary', text: 'Bubble Burst' }),
        el('p', { className: 'gate-tagline', text: 'Loading your zen...' }),
        el('div', { className: 'loader' }),
      ]),
    ])
  );
}

function renderGate(): void {
  app.append(renderGateScreen(state, hubHandlers()));
}

function startMode(mode: 'ZEN' | 'BLITZ'): void {
  unlockAudio();
  cleanupPlaying();
  resetSession(state);
  state.blitzResults = null;
  state.activeMode = mode;
  populateGrid(state);
  state.route = 'PLAYING';
  render();
}

function renderPlaying(): void {
  playingMount = renderPlayingScreen(state, {
    onExit: () => {
      void exitPlaying();
    },
    onOpenSettings: () => showSettings('playing'),
  });

  app.append(playingMount.section);

  visualStack = attachVisualStack(playingMount.section);

  detachPointer = attachPointerEngine(
    playingMount.grid,
    state,
    () => playingMount?.refreshHud(),
    {
      onPopAt: (x, y, combo) => visualStack?.popAt(x, y, combo),
    }
  );

  const comboLoop = (): void => {
    if (!settingsOpen) {
      updateComboDecay(state, performance.now());
      playingMount?.refreshHud();
    }
    comboRaf = requestAnimationFrame(comboLoop);
  };
  comboRaf = requestAnimationFrame(comboLoop);

  if (state.activeMode === 'BLITZ') {
    blitzTimer = startBlitzTimer(
      state,
      () => playingMount?.refreshHud(),
      () => void finishBlitz()
    );
  }

  playingMount.refreshHud();
}

async function syncZenSessionPops(): Promise<void> {
  if (state.activeMode !== 'ZEN' || state.session.popsThisSession <= 0) return;

  const pops = state.session.popsThisSession;
  state.session.popsThisSession = 0;

  try {
    const result = await syncLifetimePops(pops);
    state.lifetimePops = result.lifetimePops;
    pushActivity(state, {
      mode: 'ZEN',
      score: pops,
      detail: `${pops} pops this session`,
      at: Date.now(),
    });
  } catch (error) {
    state.session.popsThisSession = pops;
    console.warn('Failed to sync zen pops:', error);
  }
}

async function restartActiveMode(): Promise<void> {
  const mode = state.activeMode;
  if (!mode) return;

  if (mode === 'ZEN') {
    await syncZenSessionPops();
  }

  startMode(mode);
}

async function exitPlaying(): Promise<void> {
  if (exitingPlaying) return;
  exitingPlaying = true;

  cleanupPlaying();
  await syncZenSessionPops();

  state.activeMode = null;
  state.route = 'GATE';
  exitingPlaying = false;
  render();
}

async function finishBlitz(): Promise<void> {
  cleanupPlaying();

  try {
    const result = await submitBlitzScore(state.session.score, state.session.maxCombo);
    state.top10Blitz = result.top10Blitz;
    state.highestComboBlitz = result.highestComboBlitz;
    state.blitzResults = {
      isHighScore: result.isHighScore,
      rank: result.rank,
      previousBest: result.previousBest,
      score: result.score,
      maxCombo: state.session.maxCombo,
      at: Date.now(),
    };
    pushActivity(state, {
      mode: 'BLITZ',
      score: result.score,
      detail: result.isHighScore ? 'New high score!' : `Combo x${state.session.maxCombo}`,
      at: Date.now(),
    });
    if (result.isHighScore) {
      state.personalBestBlitz = result.score;
    }
    state.blitzRank = result.rank;
  } catch (error) {
    console.warn('Failed to submit blitz score:', error);
    state.blitzResults = {
      isHighScore: false,
      rank: null,
      previousBest: null,
      score: state.session.score,
      maxCombo: state.session.maxCombo,
      at: Date.now(),
    };
  }

  state.route = 'RESULTS';
  render();
}

function renderResults(): void {
  app.append(
    renderResultsScreen(state, {
      onPlayAgain: () => startMode('BLITZ'),
      onMainMenu: () => {
        state.activeMode = null;
        state.blitzResults = null;
        state.route = 'GATE';
        render();
      },
    })
  );
}

function hubHandlers() {
  return {
    onHome: () => {
      state.route = 'GATE';
      render();
    },
    onZen: () => startMode('ZEN'),
    onBlitz: () => startMode('BLITZ'),
    onSettings: () => showSettings('gate'),
    onProfile: () => {
      state.route = 'STATS';
      render();
    },
  };
}

function renderStats(): void {
  app.append(renderStatsScreen(state, hubHandlers()));
}

async function boot(): Promise<void> {
  render();
  try {
    const init = await fetchInitData();
    state.username = init.username;
    state.lifetimePops = init.lifetimePops;
    state.personalBestBlitz = init.personalBestBlitz;
    state.blitzRank = init.blitzRank;
    state.zenRank = init.zenRank;
    state.highestComboBlitz = init.highestComboBlitz;
    state.top10Blitz = init.top10Blitz;
    state.top10Zen = init.top10Zen;
    state.route = 'GATE';
  } catch (error) {
    console.warn('Init failed, using defaults:', error);
    state.route = 'GATE';
  }
  render();
}

void boot();
