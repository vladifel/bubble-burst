import type {
  ActivityEntry,
  BlitzLeaderboardEntry,
  BlitzResultsMeta,
  GameMode,
  LeaderboardEntry,
  UiRoute,
} from '../shared/api';

export type BubbleState = {
  popped: boolean;
  type: 'intact' | 'popped';
};

export type UiState = {
  route: UiRoute;
  activeMode: GameMode | null;
  username: string;
  lifetimePops: number;
  personalBestBlitz: number | null;
  blitzRank: number | null;
  zenRank: number | null;
  highestComboBlitz: number;
  top10Blitz: BlitzLeaderboardEntry[];
  top10Zen: LeaderboardEntry[];
  recentActivity: ActivityEntry[];
  blitzResults: BlitzResultsMeta | null;
  settings: {
    haptics: boolean;
    audio: boolean;
  };
  session: {
    score: number;
    popsThisSession: number;
    maxCombo: number;
    timeRemaining: number;
    comboMultiplier: number;
    lastPopAt: number;
    lastComboIncreaseAt: number;
    gridCols: number;
    gridRows: number;
    bubbles: Map<string, BubbleState>;
  };
};

export function createInitialState(): UiState {
  return {
    route: 'BOOT',
    activeMode: null,
    username: 'player',
    lifetimePops: 0,
    personalBestBlitz: null,
    blitzRank: null,
    zenRank: null,
    highestComboBlitz: 0,
    top10Blitz: [],
    top10Zen: [],
    recentActivity: [],
    blitzResults: null,
    settings: {
      haptics: true,
      audio: true,
    },
    session: {
      score: 0,
      popsThisSession: 0,
      maxCombo: 1,
      timeRemaining: 60_000,
      comboMultiplier: 1,
      lastPopAt: 0,
      lastComboIncreaseAt: 0,
      gridCols: 6,
      gridRows: 6,
      bubbles: new Map(),
    },
  };
}

export function pushActivity(state: UiState, entry: ActivityEntry): void {
  state.recentActivity = [entry, ...state.recentActivity].slice(0, 5);
}

export function resetSession(state: UiState): void {
  state.session = {
    score: 0,
    popsThisSession: 0,
    maxCombo: 1,
    timeRemaining: 60_000,
    comboMultiplier: 1,
    lastPopAt: 0,
    lastComboIncreaseAt: 0,
    gridCols: 6,
    gridRows: 6,
    bubbles: new Map(),
  };
}
