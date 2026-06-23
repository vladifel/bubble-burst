export const REDIS_KEYS = {
  userStats: 'user_stats',
  blitzLeaderboard: 'leaderboard:blitz',
  zenLeaderboard: 'leaderboard:zen',
  userBlitzCombo: 'user_blitz_combo',
} as const;

/** Server-side caps to limit client abuse on score sync endpoints. */
export const API_LIMITS = {
  maxSyncPopsPerRequest: 5_000,
  maxBlitzScore: 999_999,
  maxCombo: 999,
} as const;

export type GameMode = 'ZEN' | 'BLITZ';

export type LeaderboardMode = 'BLITZ' | 'ZEN';

export type UiRoute = 'BOOT' | 'GATE' | 'PLAYING' | 'RESULTS' | 'STATS';

export type LeaderboardEntry = {
  member: string;
  username: string;
  score: number;
  rank?: number;
  totalPopped?: number;
  highScore?: number;
};

export type BlitzLeaderboardEntry = LeaderboardEntry;

export type BlitzResultsMeta = {
  isHighScore: boolean;
  rank: number | null;
  previousBest: number | null;
  score: number;
  maxCombo: number;
  at: number;
};

export type ActivityEntry = {
  mode: GameMode;
  score: number;
  detail: string;
  at: number;
};

export type InitDataResponse = {
  type: 'INIT_DATA';
  username: string;
  lifetimePops: number;
  personalBestBlitz: number | null;
  blitzRank: number | null;
  zenRank: number | null;
  highestComboBlitz: number;
  top10Blitz: BlitzLeaderboardEntry[];
  top10Zen: LeaderboardEntry[];
};

export type LeaderboardResponse = {
  type: 'LEADERBOARD';
  top10Blitz: BlitzLeaderboardEntry[];
  top10Zen: LeaderboardEntry[];
  personalBestBlitz: number | null;
  blitzRank: number | null;
  zenRank: number | null;
  lifetimePops: number;
};

export type SyncPopsRequest = {
  type: 'SYNC_POPS';
  count: number;
};

export type SyncPopsResponse = {
  type: 'SYNC_POPS';
  lifetimePops: number;
};

export type SubmitScoreRequest = {
  type: 'SUBMIT_SCORE';
  score: number;
  maxCombo?: number;
};

export type SubmitScoreResponse = {
  type: 'SUBMIT_SCORE';
  score: number;
  isHighScore: boolean;
  previousBest: number | null;
  rank: number | null;
  highestComboBlitz: number;
  top10Blitz: BlitzLeaderboardEntry[];
};

export function computeBlitzRank(card: number, ascendingRank: number): number {
  return card - ascendingRank;
}

export type ErrorResponse = {
  type: 'ERROR';
  message: string;
};

export function parseLeaderboardMember(member: string): {
  userId: string;
  username: string;
} {
  const separator = member.indexOf(':');
  if (separator === -1) {
    return { userId: member, username: 'player' };
  }
  return {
    userId: member.slice(0, separator),
    username: member.slice(separator + 1) || 'player',
  };
}

export function formatLeaderboardMember(userId: string, username: string): string {
  return `${userId}:${username}`;
}
