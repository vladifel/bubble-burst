import { renderGateTopNav } from '../ui/app-topnav';
import { el, elWithClick, icon } from '../dom';
import type { UiState } from '../state';
import { formatScore } from '../ui/format';
import type { HubChromeHandlers } from '../ui/hub-chrome';

export type GateHandlers = HubChromeHandlers;

function renderModeButton(
  label: string,
  symbol: string,
  filled: boolean,
  onClick: () => void
): HTMLElement {
  return elWithClick(
    'button',
    { className: 'gate-mode-btn', type: 'button', 'aria-label': label },
    onClick,
    [
      el('span', { className: 'gate-mode-btn-shine' }),
      el('span', { className: 'gate-mode-btn-content' }, [
        icon(symbol, filled),
        el('span', { className: 'gate-mode-btn-label label-caps', text: label }),
      ]),
    ]
  );
}

export function renderGateScreen(state: UiState, handlers: GateHandlers): HTMLElement {
  return el('section', { className: 'screen screen-gate gate-v2 gate-aligned' }, [
    el('div', { className: 'gate-bg' }, [
      el('img', {
        className: 'gate-bg-image',
        src: '/assets/background.png',
        alt: '',
      }),
      el('div', { className: 'gate-bg-gradient' }),
    ]),
    renderGateTopNav(handlers),
    el('main', { className: 'gate-canvas' }, [
      el('div', { className: 'gate-hero-block floating-bubble' }, [
        el('div', { className: 'gate-hero-stack' }, [
          el('img', {
            className: 'gate-hero-bubble',
            src: '/assets/icon.png',
            alt: 'Bubble Burst hero bubble',
          }),
        ]),
        el('div', { className: 'gate-xp-meta' }, [
          el('p', { className: 'gate-mobile-kicker label-caps', text: 'Pop to Power Up' }),
          el('div', { className: 'gate-mobile-xp' }, [
            icon('bolt', true),
            el('span', { text: `${formatScore(state.lifetimePops)} XP` }),
          ]),
        ]),
        el('p', {
          className: 'gate-play-hint label-caps',
          text: 'Choose a mode below to start playing',
        }),
      ]),
      el('div', { className: 'gate-mode-actions' }, [
        renderModeButton('Zen Mode', 'spa', false, handlers.onZen),
        renderModeButton('Blitz Mode', 'bolt', true, handlers.onBlitz),
      ]),
    ]),
  ]);
}
