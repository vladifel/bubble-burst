import { el, elWithClick, icon } from '../dom';
import type { HubChromeHandlers } from './hub-chrome';

function renderTopNavProfile(interactive: boolean, onProfile?: () => void): HTMLElement {
  const content = [icon('person')];
  if (interactive && onProfile) {
    return elWithClick(
      'button',
      { className: 'app-topnav-profile', type: 'button', title: 'My Stats' },
      onProfile,
      content
    );
  }
  return el('div', { className: 'app-topnav-profile' }, content);
}

function renderScoreboardTopNavEnd(onSettings: () => void): HTMLElement {
  return el('div', { className: 'app-topnav-end' }, [
    elWithClick(
      'button',
      { className: 'app-topnav-icon glass-vessel', type: 'button', title: 'Settings' },
      onSettings,
      [icon('settings')]
    ),
    renderTopNavProfile(false),
  ]);
}

/** Scoreboard — back | centered title | settings + profile */
export function renderScoreboardTopNav(handlers: HubChromeHandlers): HTMLElement {
  return el('header', { className: 'app-topnav app-topnav-scoreboard' }, [
    elWithClick(
      'button',
      {
        className: 'app-topnav-back glass-vessel',
        type: 'button',
        'aria-label': 'Go back',
      },
      handlers.onHome,
      [icon('arrow_back')]
    ),
    el('h1', { className: 'app-topnav-title', text: 'Bubble Burst' }),
    renderScoreboardTopNavEnd(handlers.onSettings),
  ]);
}

/** Gate — brand left | actions */
export function renderGateTopNav(handlers: HubChromeHandlers): HTMLElement {
  return el('header', { className: 'app-topnav app-topnav-gate' }, [
    el('span', { className: 'app-topnav-title app-topnav-title-left gate-brand', text: 'Bubble Burst' }),
    el('div', { className: 'app-topnav-end' }, [
      el('div', { className: 'app-topnav-actions' }, [
        elWithClick(
          'button',
          {
            className: 'app-topnav-icon gate-icon-btn glass-vessel gate-mobile-only',
            type: 'button',
            title: 'Settings',
          },
          handlers.onSettings,
          [icon('settings')]
        ),
        elWithClick(
          'button',
          {
            className: 'app-topnav-icon gate-icon-btn glass-vessel gate-desktop-only',
            type: 'button',
            title: 'Settings',
          },
          handlers.onSettings,
          [icon('settings')]
        ),
        elWithClick(
          'button',
          {
            className: 'app-topnav-profile-btn gate-profile gate-mobile-only',
            type: 'button',
            title: 'My Stats',
          },
          handlers.onProfile,
          [
            el('span', { className: 'app-topnav-profile-avatar' }, [
              el('img', { className: 'app-topnav-profile-img', src: '/assets/icon.png', alt: '' }),
            ]),
          ]
        ),
        elWithClick(
          'button',
          {
            className: 'app-topnav-profile-btn gate-profile gate-desktop-only',
            type: 'button',
            title: 'My Stats',
          },
          handlers.onProfile,
          [el('span', { className: 'app-topnav-profile' }, [icon('person')])]
        ),
      ]),
    ]),
  ]);
}
