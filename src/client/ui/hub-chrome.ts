import { el, elWithClick, icon } from '../dom';

export type HubNav = 'home' | 'zen' | 'blitz';

export type HubNavActive = HubNav | null;

export type HubChromeHandlers = {
  onHome: () => void;
  onZen: () => void;
  onBlitz: () => void;
  onSettings: () => void;
  onProfile: () => void;
};

export function renderHubAmbientBg(): HTMLElement {
  return el('div', { className: 'hub-ambient' }, [
    el('div', { className: 'hub-ambient-orb hub-ambient-orb-a' }),
    el('div', { className: 'hub-ambient-orb hub-ambient-orb-b' }),
    el('div', { className: 'hub-ambient-orb hub-ambient-orb-c' }),
  ]);
}

export function renderHubTopNav(handlers: HubChromeHandlers): HTMLElement {
  return el('nav', { className: 'hub-topnav' }, [
    el('span', { className: 'hub-brand label-caps', text: 'Bubble Burst' }),
    el('div', { className: 'hub-topnav-actions' }, [
      el('button', {
        className: 'hub-topnav-icon',
        type: 'button',
        title: 'Help',
        disabled: true,
      }, [icon('help')]),
      elWithClick(
        'button',
        { className: 'hub-topnav-icon', type: 'button', title: 'Settings' },
        handlers.onSettings,
        [icon('settings')]
      ),
      elWithClick(
        'button',
        { className: 'hub-profile-btn', type: 'button', title: 'My Stats' },
        handlers.onProfile,
        [
          el('img', {
            className: 'hub-profile-img',
            src: '/assets/icon.png',
            alt: '',
          }),
        ]
      ),
    ]),
  ]);
}

export function renderHubBottomNav(active: HubNavActive, handlers: HubChromeHandlers): HTMLElement {
  const items: { id: HubNav; label: string; symbol: string; action: () => void }[] = [
    { id: 'home', label: 'Home', symbol: 'home', action: handlers.onHome },
    { id: 'zen', label: 'Zen', symbol: 'spa', action: handlers.onZen },
    { id: 'blitz', label: 'Blitz', symbol: 'bolt', action: handlers.onBlitz },
  ];

  return el('div', { className: 'hub-bottomnav-wrap' }, [
    el('nav', { className: 'hub-bottomnav glass-panel', 'aria-label': 'Main navigation' }, [
      ...items.map((item) =>
        elWithClick(
          'button',
          {
            className: `hub-bottomnav-btn${active === item.id ? ' is-active' : ''}`,
            type: 'button',
            title: item.label,
            'aria-label': item.label,
            'data-nav': item.id,
            'aria-current': active === item.id ? 'page' : undefined,
          },
          item.action,
          [
            icon(item.symbol, active === item.id),
            el('span', { className: 'label-caps', text: item.label }),
          ]
        )
      ),
    ]),
  ]);
}

export function renderHubPageShell(
  activeNav: HubNavActive,
  handlers: HubChromeHandlers,
  mainContent: HTMLElement,
  options?: { className?: string }
): HTMLElement {
  return el('section', { className: `screen hub-screen${options?.className ? ` ${options.className}` : ''}` }, [
    renderHubAmbientBg(),
    renderHubTopNav(handlers),
    mainContent,
    renderHubBottomNav(activeNav, handlers),
  ]);
}

export function renderHubPageHeader(title: string, subtitle: string, centered = false): HTMLElement {
  return el('header', { className: `hub-page-header${centered ? ' hub-page-header-center' : ''}` }, [
    el('h1', { className: 'hub-page-title', text: title }),
    el('p', { className: 'hub-page-subtitle', text: subtitle }),
  ]);
}
