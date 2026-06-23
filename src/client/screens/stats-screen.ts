import { el, icon } from '../dom';
import type { UiState } from '../state';
import { formatActivityPoints, formatCompactScore, formatScore } from '../ui/format';
import { renderScoreboardTopNav } from '../ui/app-topnav';
import { type HubChromeHandlers } from '../ui/hub-chrome';

export type StatsHandlers = HubChromeHandlers;

const DESKTOP_BURST_HEIGHTS = [30, 50, 80, 100, 70, 40, 60];
const DESKTOP_BURST_OPACITY = [20, 40, 60, 100, 60, 30, 50];
const MOBILE_BURST_OPACITY = [40, 20, 60, 80, 100, 50, 30];

function mobileBurstBars(heights: number[]): { height: number; isPeak: boolean }[] {
  const peak = Math.max(...heights);
  return heights.map((value) => ({
    height: Math.max(20, Math.round((value / 100) * 144)),
    isPeak: value === peak && peak > 20,
  }));
}

function formatActivityTime(at: number): string {
  const date = new Date(at);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today • ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return `Yesterday • ${time}`;

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${time}`;
}

function formatRelativeTime(at: number): string {
  const diffMs = Date.now() - at;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1d ago' : `${days}d ago`;
}

function estimatePlayTime(pops: number): string {
  const totalMinutes = Math.floor((pops * 1.5) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function playerLevel(pops: number): number {
  return Math.max(1, Math.floor(pops / 1000) + 1);
}

function levelsCleared(pops: number): number {
  if (pops <= 0) return 0;
  return Math.max(1, Math.floor(pops / 3325));
}

function completionRate(pops: number, level: number): string {
  if (pops <= 0) return 'Play to begin';
  const rate = Math.min(99, Math.max(60, 80 + level));
  return `${rate}% Completion Rate`;
}

function weeklyTrendLabel(state: UiState): string | null {
  const weekMs = 7 * 86_400_000;
  const now = Date.now();
  const thisWeek = state.recentActivity.filter((item) => now - item.at < weekMs).length;
  const lastWeek = state.recentActivity.filter((item) => {
    const age = now - item.at;
    return age >= weekMs && age < weekMs * 2;
  }).length;

  if (thisWeek === 0 && lastWeek === 0) return null;
  if (lastWeek === 0) return '+100% this week';
  const pct = ((thisWeek - lastWeek) / lastWeek) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}% this week`;
}

function weeklyBurstHeights(state: UiState): number[] {
  if (state.recentActivity.length === 0) return DESKTOP_BURST_HEIGHTS;

  const counts = new Array(7).fill(0);
  for (const item of state.recentActivity) {
    const day = new Date(item.at).getDay();
    const monFirstIndex = day === 0 ? 6 : day - 1;
    counts[monFirstIndex] += 1;
  }
  const max = Math.max(...counts, 1);
  return counts.map((count, index) =>
    Math.max(20, Math.round((count / max) * 100) || DESKTOP_BURST_HEIGHTS[index]!)
  );
}

type ActivityItem = { mode: 'ZEN' | 'BLITZ'; score: number; detail: string; at: number };

function desktopActivityVisual(item: ActivityItem): { symbol: string; className: string } {
  const detail = item.detail.toLowerCase();
  if (detail.includes('rank')) {
    return { symbol: 'emoji_events', className: 'stats-activity-icon-tournament' };
  }
  if (item.mode === 'ZEN') {
    return { symbol: 'spa', className: 'stats-activity-icon-zen' };
  }
  if (detail.includes('quick') || detail.includes('session') || detail.includes('level')) {
    return { symbol: 'home', className: 'stats-activity-icon-blitz' };
  }
  return { symbol: 'bolt', className: 'stats-activity-icon-blitz' };
}

function desktopActivityTitle(item: ActivityItem): string {
  const detail = item.detail.toLowerCase();
  if (detail.includes('rank')) return 'Tournament Qualifiers';
  if (detail.includes('level') && item.mode === 'ZEN') return `Level ${Math.max(1, Math.floor(item.score / 6000))} Complete`;
  if (detail.includes('quick') || detail.includes('session')) return `Standard Level ${levelsCleared(item.score)}`;
  return item.mode === 'BLITZ' ? 'Blitz Mode' : 'Zen Mode';
}

function desktopActivityScoreClass(item: ActivityItem): string {
  const detail = item.detail.toLowerCase();
  if (detail.includes('high')) return 'stats-activity-score glow-text-cyan';
  if (detail.includes('rank')) return 'stats-activity-score stats-activity-score-tournament glow-text-magenta';
  return 'stats-activity-score';
}

function mobileActivityVisual(item: ActivityItem): { symbol: string; className: string } {
  const detail = item.detail.toLowerCase();
  if (item.mode === 'BLITZ' && detail.includes('combo')) {
    return { symbol: 'local_fire_department', className: 'stats-mobile-activity-icon-blitz' };
  }
  if (item.mode === 'ZEN') {
    return { symbol: 'workspace_premium', className: 'stats-mobile-activity-icon-zen' };
  }
  return { symbol: 'sports_esports', className: 'stats-mobile-activity-icon-muted' };
}

function mobileActivityTitle(item: ActivityItem): string {
  const detail = item.detail.toLowerCase();
  if (detail.includes('high')) return 'New High Score';
  if (detail.includes('combo')) return 'New Combo Record';
  if (detail.includes('rank')) return 'Played Daily Challenge';
  if (item.mode === 'ZEN') return `Cleared Level ${Math.max(1, Math.floor(item.score / 2000))}`;
  return 'Blitz Run';
}

function mobileActivitySubtitle(item: ActivityItem): string {
  const modeLabel = item.mode === 'BLITZ' ? 'Blitz Mode' : 'Zen Mode';
  const detail = item.detail.toLowerCase();
  if (detail.includes('combo')) return `${modeLabel} • ${item.detail.replace(/^combo\s*/i, '')}`;
  if (detail.includes('rank')) return 'Ranked Top 10%';
  if (detail.includes('high')) return `${modeLabel} • Perfect Score`;
  if (detail.includes('best')) return `${modeLabel} • Personal Best`;
  return `${modeLabel} • ${item.detail}`;
}

function mobileActivityPointsClass(item: ActivityItem): string {
  const detail = item.detail.toLowerCase();
  if (detail.includes('combo')) return 'stats-mobile-activity-points stats-mobile-activity-points-blitz';
  if (detail.includes('high') || item.mode === 'ZEN') {
    return 'stats-mobile-activity-points stats-mobile-activity-points-hot';
  }
  return 'stats-mobile-activity-points';
}

function renderStatsBg(): HTMLElement {
  return el('div', { className: 'stats-bg' }, [
    el('img', { className: 'stats-bg-image', src: '/assets/background.png', alt: '' }),
    el('div', { className: 'stats-bg-overlay' }),
  ]);
}

function desktopActivityRow(item: ActivityItem): HTMLElement {
  const visual = desktopActivityVisual(item);
  return el('div', { className: 'stats-activity-row glass-vessel' }, [
    el('div', { className: 'stats-activity-left' }, [
      el('div', { className: `stats-activity-icon ${visual.className}` }, [icon(visual.symbol)]),
      el('div', {}, [
        el('p', { className: 'stats-activity-mode', text: desktopActivityTitle(item) }),
        el('p', { className: 'stats-activity-time', text: formatActivityTime(item.at) }),
      ]),
    ]),
    el('div', { className: 'stats-activity-right' }, [
      el('p', { className: desktopActivityScoreClass(item), text: formatScore(item.score) }),
      el('p', { className: 'stats-activity-detail', text: item.detail }),
    ]),
  ]);
}

function mobileActivityRow(item: ActivityItem): HTMLElement {
  const visual = mobileActivityVisual(item);
  return el('div', { className: 'stats-mobile-activity-row glass-panel' }, [
    el('div', { className: `stats-mobile-activity-icon ${visual.className}` }, [
      icon(visual.symbol, true),
    ]),
    el('div', { className: 'stats-mobile-activity-copy' }, [
      el('h3', { className: 'stats-mobile-activity-title', text: mobileActivityTitle(item) }),
      el('p', { className: 'stats-mobile-activity-sub', text: mobileActivitySubtitle(item) }),
    ]),
    el('div', { className: 'stats-mobile-activity-meta' }, [
      el('span', {
        className: mobileActivityPointsClass(item),
        text: formatActivityPoints(item.score),
      }),
      el('p', { className: 'stats-mobile-activity-when', text: formatRelativeTime(item.at) }),
    ]),
  ]);
}

function buildFallbackActivity(state: UiState): ActivityItem[] {
  const items: ActivityItem[] = [];
  if (state.personalBestBlitz != null && state.personalBestBlitz > 0) {
    items.push({
      mode: 'BLITZ',
      score: state.personalBestBlitz,
      detail: 'New High Score!',
      at: Date.now(),
    });
  }
  if (state.lifetimePops > 0) {
    items.push({
      mode: 'ZEN',
      score: state.lifetimePops,
      detail: 'Level Complete',
      at: Date.now() - 86_400_000,
    });
  }
  return items;
}

function renderDesktopStats(
  state: UiState,
  level: number,
  combo: number,
  activities: ActivityItem[],
  burstHeights: number[],
  playProgress: number,
  trendLabel: string | null
): HTMLElement {
  const cleared = levelsCleared(state.lifetimePops);

  return el('main', { className: 'stats-page stats-page-desktop' }, [
    el('section', { className: 'stats-title-row' }, [
      el('div', { className: 'stats-hero-copy' }, [
        el('h2', { className: 'stats-hero-title glow-text-cyan', text: 'Player Profile & Stats' }),
        el('p', {
          className: 'stats-hero-sub',
          text: 'Tracking your rise to bubble-popping glory.',
        }),
      ]),
      el('div', { className: 'stats-veteran-chip glass-vessel' }, [
        icon('stars', true),
        el('span', { className: 'label-caps', text: `Level ${level} • Veteran` }),
      ]),
    ]),
    el('section', { className: 'stats-bento' }, [
      el('div', { className: 'stats-card stats-card-lifetime glass-vessel stats-card-float' }, [
        el('div', { className: 'stats-card-top' }, [
          el('span', { className: 'label-caps stats-card-label', text: 'Lifetime Popped' }),
          icon('bubble_chart'),
        ]),
        el('div', { className: 'stats-card-body' }, [
          el('p', { className: 'stats-mega-value glow-text-cyan', text: formatScore(state.lifetimePops) }),
          trendLabel
            ? el('p', { className: 'stats-trend label-caps' }, [
                icon('trending_up'),
                el('span', { text: trendLabel }),
              ])
            : el('span'),
        ]),
        el('div', { className: 'stats-card-glow stats-card-glow-cyan' }),
      ]),
      el('div', { className: 'stats-card stats-card-combo glass-vessel stats-card-float' }, [
        el('div', { className: 'stats-card-top' }, [
          el('span', { className: 'label-caps stats-card-label', text: 'Highest Combo' }),
          icon('bolt'),
        ]),
        el('div', { className: 'stats-card-body' }, [
          el('p', { className: 'stats-card-value glow-text-magenta', text: `x${combo}` }),
          el('p', { className: 'stats-card-foot', text: 'Achieved in Blitz Mode' }),
        ]),
      ]),
      el('div', { className: 'stats-card stats-card-rank glass-vessel stats-card-float' }, [
        el('div', { className: 'stats-card-top' }, [
          el('span', { className: 'label-caps stats-card-label', text: 'Levels Cleared' }),
          icon('layers'),
        ]),
        el('div', { className: 'stats-card-body' }, [
          el('p', { className: 'stats-card-value stats-value-green', text: String(cleared) }),
          el('p', { className: 'stats-card-foot', text: completionRate(state.lifetimePops, level) }),
        ]),
      ]),
      el('div', { className: 'stats-card stats-card-time glass-vessel stats-card-float' }, [
        el('div', { className: 'stats-time-well sunken-well' }, [icon('schedule')]),
        el('div', { className: 'stats-time-copy' }, [
          el('span', { className: 'label-caps stats-card-label', text: 'Total Time Popped' }),
          el('p', { className: 'stats-time-value', text: estimatePlayTime(state.lifetimePops) }),
          el('div', { className: 'stats-time-track' }, [
            el('div', {
              className: 'stats-time-fill',
              style: `width: ${playProgress || 70}%`,
            }),
          ]),
        ]),
      ]),
      el('div', { className: 'stats-card stats-card-burst glass-vessel' }, [
        el('span', { className: 'label-caps stats-card-label stats-card-label-block', text: 'Activity Burst' }),
        el('div', { className: 'stats-burst-chart' }, [
          ...burstHeights.map((height, index) =>
            el('div', {
              className: `stats-burst-bar stats-burst-bar-op-${DESKTOP_BURST_OPACITY[index]}${
                height >= 90 ? ' is-peak' : ''
              }`,
              style: `height: ${height}%`,
            })
          ),
        ]),
        el('div', { className: 'stats-burst-days label-caps' }, [
          el('span', { text: 'Mon' }),
          el('span', { text: 'Tue' }),
          el('span', { text: 'Wed' }),
          el('span', { text: 'Thu' }),
          el('span', { text: 'Fri' }),
          el('span', { text: 'Sat' }),
          el('span', { text: 'Sun' }),
        ]),
      ]),
    ]),
    el('section', { className: 'stats-activity-section' }, [
      el('div', { className: 'stats-activity-header' }, [
        el('h3', { className: 'stats-activity-title', text: 'Recent Activity' }),
        el('div', { className: 'stats-activity-rule' }),
      ]),
      el('div', { className: 'stats-activity-list' }, activities.map((item) => desktopActivityRow(item))),
      el('button', {
        className: 'stats-history-btn glass-vessel',
        type: 'button',
        text: 'View Full Match History',
      }),
    ]),
  ]);
}

function renderMobileStats(
  state: UiState,
  combo: number,
  activities: ActivityItem[],
  burstHeights: number[]
): HTMLElement {
  const burstBars = mobileBurstBars(burstHeights);
  const peakDay = burstBars.findIndex((bar) => bar.isPeak);
  return el('main', { className: 'stats-page stats-page-mobile' }, [
    el('section', { className: 'stats-mobile-quick-grid' }, [
      el('div', { className: 'stats-mobile-stat glass-panel' }, [
        el('div', { className: 'stats-mobile-stat-glow stats-mobile-stat-glow-cyan' }),
        el('span', { className: 'label-caps stats-mobile-stat-label', text: 'Lifetime Popped' }),
        el('span', {
          className: 'stats-mobile-stat-value stats-text-gradient',
          text: formatCompactScore(state.lifetimePops),
        }),
      ]),
      el('div', { className: 'stats-mobile-stat glass-panel' }, [
        el('div', { className: 'stats-mobile-stat-glow stats-mobile-stat-glow-magenta' }),
        el('span', { className: 'label-caps stats-mobile-stat-label', text: 'Highest Combo' }),
        el('span', { className: 'stats-mobile-stat-value stats-mobile-combo-value', text: `${combo}x` }),
      ]),
    ]),
    el('section', { className: 'stats-mobile-burst glass-panel' }, [
      el('div', { className: 'stats-mobile-burst-head' }, [
        el('h2', { className: 'stats-mobile-burst-title', text: 'Activity Burst' }),
        icon('monitoring'),
      ]),
      el('div', { className: 'stats-mobile-burst-chart' }, [
        ...burstBars.map((bar, index) =>
          el('div', {
            className: `stats-mobile-burst-bar stats-mobile-burst-bar-op-${MOBILE_BURST_OPACITY[index]}${
              bar.isPeak ? ' is-peak neon-glow-secondary' : ''
            }`,
            style: `height: ${bar.height}px`,
          })
        ),
      ]),
      el('div', { className: 'stats-mobile-burst-days label-caps' }, [
        ...['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) =>
          el('span', {
            className: index === peakDay ? 'is-peak-day' : undefined,
            text: label,
          })
        ),
      ]),
    ]),
    el('section', { className: 'stats-mobile-activity-section' }, [
      el('h2', { className: 'stats-mobile-activity-heading', text: 'Recent Activity' }),
      el('div', { className: 'stats-mobile-activity-list' }, activities.map((item) => mobileActivityRow(item))),
    ]),
  ]);
}

export function renderStatsScreen(state: UiState, handlers: StatsHandlers): HTMLElement {
  const level = playerLevel(state.lifetimePops);
  const combo = Math.max(state.highestComboBlitz, state.session.maxCombo, 1);
  const activities =
    state.recentActivity.length > 0 ? state.recentActivity : buildFallbackActivity(state);
  const burstHeights = weeklyBurstHeights(state);
  const playProgress = Math.min(100, Math.round((state.lifetimePops % 1000) / 10));
  const trendLabel = weeklyTrendLabel(state);
  return el('section', { className: 'screen hub-screen screen-stats' }, [
    renderStatsBg(),
    renderScoreboardTopNav(handlers),
    renderDesktopStats(state, level, combo, activities, burstHeights, playProgress, trendLabel),
    renderMobileStats(state, combo, activities, burstHeights),
  ]);
}
