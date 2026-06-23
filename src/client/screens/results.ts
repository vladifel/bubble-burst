import { el, elWithClick, icon, statBar } from '../dom';
import type { UiState } from '../state';
import { comboFillPercent, formatScore, scoreGrade } from '../ui/format';

export type ResultsHandlers = {
  onPlayAgain: () => void;
  onMainMenu: () => void;
};

export function renderResultsScreen(
  state: UiState,
  handlers: ResultsHandlers
): HTMLElement {
  const { session, blitzResults } = state;
  const grade = scoreGrade(session.score);
  const popPercent = Math.min(100, (session.popsThisSession / 100) * 100);
  const comboPercent = comboFillPercent(session.maxCombo);
  const isHighScore = blitzResults?.isHighScore ?? false;
  const rank = blitzResults?.rank ?? null;
  const previousBest = blitzResults?.previousBest;
  const improvement =
    previousBest != null && session.score > previousBest
      ? session.score - previousBest
      : null;

  const headerExtras: HTMLElement[] = [];
  if (isHighScore) {
    headerExtras.push(
      el('p', {
        className: 'results-high-score-badge label-caps',
        text: 'New Personal Best!',
      })
    );
  }
  if (rank != null) {
    headerExtras.push(
      el('p', {
        className: 'results-rank label-caps',
        text: `Your Rank #${rank}`,
      })
    );
  }
  if (improvement != null && improvement > 0 && !isHighScore) {
    headerExtras.push(
      el('p', {
        className: 'results-improvement',
        text: `+${formatScore(improvement)} vs your best`,
      })
    );
  }

  const personalBestValue =
    state.personalBestBlitz != null && state.personalBestBlitz > 0
      ? formatScore(state.personalBestBlitz)
      : '—';
  const personalBestPercent =
    state.personalBestBlitz != null && state.personalBestBlitz > 0
      ? Math.min(100, (session.score / state.personalBestBlitz) * 100)
      : 0;

  return el('section', { className: 'screen screen-results' }, [
    el('div', { className: 'immersive-bg' }, [
      el('img', {
        className: 'immersive-bg-image',
        src: '/assets/background.png',
        alt: '',
      }),
      el('div', { className: 'immersive-bg-gradient' }),
    ]),
    el('main', { className: 'results-main' }, [
      el('h1', {
        className: 'results-heading neon-text-primary',
        text: "TIME'S UP",
      }),
      ...headerExtras,
      el('div', { className: 'results-card glass-panel floating-bubble' }, [
        el('div', { className: 'corner-highlight corner-highlight-tl' }),
        el('div', { className: 'corner-highlight corner-highlight-br' }),
        el('div', { className: 'grade-bubble bubble-frame' }, [
          el('span', { className: 'grade-letter neon-text-tertiary', text: grade }),
          el('div', { className: 'accent-bubble accent-bubble-sm' }),
          el('div', { className: 'accent-bubble accent-bubble-md' }),
        ]),
        el('div', { className: 'score-block' }, [
          el('p', { className: 'label-caps', text: 'Total Score' }),
          el('p', {
            className: 'results-score neon-text-primary',
            text: formatScore(session.score),
          }),
        ]),
        el('div', { className: 'stats-stack' }, [
          statBar(
            'Bubbles Popped',
            String(session.popsThisSession),
            popPercent,
            'cyan'
          ),
          statBar(
            'Max Combo',
            `x${session.maxCombo}`,
            comboPercent,
            'magenta'
          ),
          statBar('Personal Best', personalBestValue, personalBestPercent, 'cyan'),
        ]),
        el('div', { className: 'results-actions' }, [
          elWithClick(
            'button',
            { className: 'glow-button-primary', type: 'button' },
            handlers.onPlayAgain,
            [icon('play_arrow', true), el('span', { className: 'label-caps', text: 'Play Again' })]
          ),
          elWithClick(
            'button',
            { className: 'glow-button-secondary', type: 'button' },
            handlers.onMainMenu,
            [icon('grid_view'), el('span', { className: 'label-caps', text: 'Main Menu' })]
          ),
        ]),
      ]),
    ]),
  ]);
}
