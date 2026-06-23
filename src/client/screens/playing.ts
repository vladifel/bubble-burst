import { el, elWithClick, icon } from '../dom';
import { createGridElement } from '../engine/pointer';
import type { UiState } from '../state';
import { comboFillPercent, formatScore, formatTimer } from '../ui/format';

export type PlayingMount = {
  section: HTMLElement;
  grid: HTMLElement;
  refreshHud: () => void;
};

export type PlayingHandlers = {
  onExit: () => void;
  onOpenSettings: () => void;
};

export function renderPlayingScreen(
  state: UiState,
  handlers: PlayingHandlers
): PlayingMount {
  const isZen = state.activeMode === 'ZEN';
  const scoreLabel = el('span', {
    id: 'hud-score',
    className: 'play-hud-value neon-text-primary',
    text: '0',
  });
  const popLabel = el('span', {
    id: 'hud-pop-count',
    className: 'play-hud-value neon-text-primary',
    text: '000',
  });
  const comboLabel = el('span', {
    id: 'hud-combo-label',
    className: 'play-combo-tag label-caps',
    text: 'COMBO X1',
  });
  const comboFill = el('div', {
    id: 'hud-combo-fill',
    className: 'play-combo-fill',
    style: 'width: 10%',
  });
  const timeLabel = el('span', {
    id: 'hud-time',
    className: 'play-hud-value neon-text-secondary',
    text: '1:00',
  });
  const energyPct = el('span', {
    id: 'hud-energy-pct',
    className: 'label-caps',
    text: '10%',
  });
  const energyFill = el('div', {
    id: 'hud-energy-fill',
    className: 'play-energy-fill',
    style: 'width: 10%',
  });

  const grid = createGridElement(state);
  const gridFrame = el('div', {
    className: 'grid-frame glass-vessel',
    style: `--grid-cols: ${state.session.gridCols}; --grid-rows: ${state.session.gridRows}`,
  }, [grid]);

  const stageChildren: HTMLElement[] = [];
  if (isZen) {
    stageChildren.push(
      el('p', { className: 'play-zen-hint label-caps', text: 'Breathe in. Tap a bubble to release.' })
    );
  } else {
    stageChildren.push(renderBlitzHud(scoreLabel, timeLabel, comboLabel, comboFill));
  }

  stageChildren.push(el('div', { className: 'grid-mount' }, [gridFrame]));

  if (isZen) {
    stageChildren.push(
      el('p', { className: 'play-zen-footer', text: 'Zen state: Continuous flow active' })
    );
  } else {
    stageChildren.push(renderBlitzEnergyBar(energyPct, energyFill));
  }

  const section = el('section', {
    className: `screen screen-playing ${isZen ? 'play-zen' : 'play-blitz'}`,
  }, [
    el('div', { className: 'visual-layer visual-layer-bg immersive-bg' }, [
      el('img', {
        className: 'immersive-bg-image',
        src: '/assets/background.png',
        alt: '',
      }),
      el('div', { className: 'immersive-bg-gradient immersive-bg-gradient-play' }),
    ]),
    el('div', { className: 'visual-layer visual-layer-shader', 'aria-hidden': 'true' }),
    el('div', { className: 'visual-layer visual-layer-particles', 'aria-hidden': 'true' }),
    isZen
      ? renderZenHeader(handlers, popLabel)
      : renderBlitzHeader(handlers),
    el('main', { className: 'play-stage' }, stageChildren),
  ]);

  const refreshHud = (): void => {
    const { session, activeMode } = state;
    if (activeMode === 'BLITZ') {
      scoreLabel.textContent = formatScore(session.score);
      timeLabel.textContent = formatTimer(session.timeRemaining);
      comboLabel.textContent = `COMBO X${session.comboMultiplier}`;
      const fill = comboFillPercent(session.comboMultiplier);
      comboFill.style.width = `${fill}%`;
      energyFill.style.width = `${fill}%`;
      energyPct.textContent = `${Math.round(fill)}%`;
      if (session.timeRemaining <= 10_000) {
        timeLabel.classList.add('play-timer-urgent');
      } else {
        timeLabel.classList.remove('play-timer-urgent');
      }
    } else {
      popLabel.textContent = String(session.popsThisSession).padStart(3, '0');
    }
  };

  return { section, grid, refreshHud };
}

function renderZenHeader(handlers: PlayingHandlers, popLabel: HTMLElement): HTMLElement {
  return el('header', { className: 'play-hud-header glass-vessel' }, [
    elWithClick(
      'button',
      { className: 'icon-btn', type: 'button', title: 'Exit' },
      () => handlers.onExit(),
      [icon('close')]
    ),
    el('span', { className: 'play-mode-title neon-text-primary', text: 'Zen Mode' }),
    el('div', { className: 'play-hud-actions' }, [
      el('div', { className: 'play-pop-chip glass-vessel' }, [
        icon('bubble_chart', true),
        popLabel,
      ]),
      elWithClick(
        'button',
        { className: 'icon-btn', type: 'button', title: 'Settings' },
        () => handlers.onOpenSettings(),
        [icon('settings')]
      ),
    ]),
  ]);
}

function renderBlitzHeader(handlers: PlayingHandlers): HTMLElement {
  return el('header', { className: 'play-hud-header play-hud-header-blitz glass-vessel' }, [
    elWithClick(
      'button',
      { className: 'icon-btn', type: 'button', title: 'Exit' },
      () => handlers.onExit(),
      [icon('close')]
    ),
    el('div', { className: 'play-blitz-brand' }, [
      icon('bubble_chart', true),
      el('span', { className: 'play-mode-title neon-text-primary', text: 'Blitz Mode' }),
    ]),
    elWithClick(
      'button',
      { className: 'icon-btn', type: 'button', title: 'Settings' },
      () => handlers.onOpenSettings(),
      [icon('settings')]
    ),
  ]);
}

function renderBlitzHud(
  scoreLabel: HTMLElement,
  timeLabel: HTMLElement,
  comboLabel: HTMLElement,
  comboFill: HTMLElement
): HTMLElement {
  return el('div', { className: 'play-blitz-hud' }, [
    el('div', { className: 'play-blitz-hud-row' }, [
      el('div', { className: 'play-stat-card glass-vessel' }, [
        el('span', { className: 'label-caps play-stat-label', text: 'Score' }),
        scoreLabel,
      ]),
      el('div', { className: 'play-stat-card glass-vessel play-stat-card-timer' }, [
        el('span', { className: 'label-caps play-stat-label', text: 'Timer' }),
        timeLabel,
      ]),
    ]),
    el('div', { className: 'play-blitz-combo glass-vessel' }, [comboFill, comboLabel]),
  ]);
}

function renderBlitzEnergyBar(energyPct: HTMLElement, energyFill: HTMLElement): HTMLElement {
  return el('div', { className: 'play-energy-bar-wrap play-desktop-only' }, [
    el('div', { className: 'play-energy-labels' }, [
      el('span', { className: 'label-caps neon-text-primary', text: 'Plasma Energy' }),
      energyPct,
    ]),
    el('div', { className: 'play-energy-track glass-vessel' }, [energyFill]),
  ]);
}
