import { el, elWithClick, icon } from '../dom';
import type { UiState } from '../state';
import { formatScore } from '../ui/format';

export type SettingsContext = 'gate' | 'playing';

export type SettingsHandlers = {
  onToggleHaptics: (value: boolean) => void;
  onToggleAudio: (value: boolean) => void;
  onClose: () => void;
  onResume?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
};

export function renderSettingsOverlay(
  state: UiState,
  context: SettingsContext,
  handlers: SettingsHandlers
): HTMLElement {
  const overlay = el('div', { className: 'settings-overlay', role: 'dialog', ariaModal: 'true' }, [
    el('div', { className: 'settings-overlay-backdrop' }),
    el('div', { className: 'settings-overlay-panel glass-vessel' }, [
      el('div', { className: 'settings-overlay-header' }, [
        el('h2', {
          className: 'settings-overlay-title neon-text-primary',
          text: context === 'playing' ? 'Paused' : 'Settings',
        }),
        el('p', {
          className: 'settings-overlay-subtitle label-caps',
          text: 'Bubble Burst Simulator',
        }),
      ]),
      el('div', { className: 'settings-overlay-body' }, [
        glowToggleRow('Haptic Feedback', 'vibration', state.settings.haptics, handlers.onToggleHaptics),
        glowToggleRow('Sound Effects', 'volume_up', state.settings.audio, handlers.onToggleAudio),
        context === 'playing'
          ? el('div', { className: 'settings-score-chip' }, [
              icon('bubble_chart', true),
              el('span', {
                className: 'label-caps',
                text: `Current Score: ${formatScore(
                  state.activeMode === 'BLITZ'
                    ? state.session.score
                    : state.session.popsThisSession
                )}`,
              }),
            ])
          : el('span'),
      ]),
      el('div', { className: 'settings-overlay-actions' }, [
        ...(context === 'playing'
          ? [
              actionButton('Resume', 'play_arrow', 'settings-btn-primary', true, () =>
                handlers.onResume?.()
              ),
              actionButton('Restart', 'refresh', 'settings-btn-secondary', false, () =>
                handlers.onRestart?.()
              ),
              actionButton('Quit to Menu', 'logout', 'settings-btn-danger', false, () =>
                handlers.onQuit?.()
              ),
            ]
          : [
              actionButton('Close', 'close', 'settings-btn-primary', true, () => handlers.onClose()),
            ]),
      ]),
    ]),
  ]);

  overlay.querySelector('.settings-overlay-backdrop')?.addEventListener('click', () => {
    if (context === 'gate') handlers.onClose();
    else handlers.onResume?.();
  });

  return overlay;
}

function glowToggleRow(
  label: string,
  symbol: string,
  checked: boolean,
  onChange: (value: boolean) => void
): HTMLElement {
  const input = el('input', { type: 'checkbox', className: 'sr-only bubble-toggle-input' }) as HTMLInputElement;
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));

  return el('label', { className: 'settings-toggle-row sunken-well' }, [
    el('span', { className: 'settings-toggle-label' }, [
      icon(symbol),
      el('span', { text: label }),
    ]),
    el('span', { className: 'bubble-toggle' }, [input, el('span', { className: 'toggle-slider' })]),
  ]);
}

function actionButton(
  label: string,
  symbol: string,
  className: string,
  filled: boolean,
  onClick: () => void
): HTMLElement {
  return elWithClick(
    'button',
    { className: `settings-action-btn ${className}`, type: 'button' },
    onClick,
    [icon(symbol, filled), el('span', { text: label })]
  );
}
