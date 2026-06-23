import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import {
  API_LIMITS,
  computeBlitzRank,
  formatLeaderboardMember,
  parseLeaderboardMember,
  REDIS_KEYS,
  type BlitzLeaderboardEntry,
  type ErrorResponse,
  type InitDataResponse,
  type LeaderboardEntry,
  type LeaderboardResponse,
  type SubmitScoreRequest,
  type SubmitScoreResponse,
  type SyncPopsRequest,
  type SyncPopsResponse,
} from '../../shared/api';

export const api = new Hono();

async function getLifetimePops(userId: string): Promise<number> {
  const lifetimeRaw = await redis.hGet(REDIS_KEYS.userStats, userId);
  return lifetimeRaw ? parseInt(lifetimeRaw, 10) : 0;
}

async function getHighestCombo(userId: string): Promise<number> {
  const raw = await redis.hGet(REDIS_KEYS.userBlitzCombo, userId);
  return raw ? parseInt(raw, 10) : 0;
}

async function updateHighestCombo(userId: string, maxCombo: number): Promise<number> {
  const current = await getHighestCombo(userId);
  if (maxCombo <= current) return current;
  await redis.hSet(REDIS_KEYS.userBlitzCombo, { [userId]: String(maxCombo) });
  return maxCombo;
}

async function getModeRank(
  key: string,
  member: string
): Promise<number | null> {
  const [ascendingRank, card] = await Promise.all([
    redis.zRank(key, member),
    redis.zCard(key),
  ]);
  if (ascendingRank === undefined || card === 0) return null;
  return computeBlitzRank(card, ascendingRank);
}

async function getTop10Blitz(): Promise<BlitzLeaderboardEntry[]> {
  const entries = await redis.zRange(REDIS_KEYS.blitzLeaderboard, 0, 9, {
    reverse: true,
    by: 'rank',
  });

  return Promise.all(
    entries.map(async (entry, index) => {
      const { userId, username } = parseLeaderboardMember(entry.member);
      const totalPopped = await getLifetimePops(userId);
      return {
        member: entry.member,
        username,
        score: entry.score,
        rank: index + 1,
        totalPopped,
        highScore: entry.score,
      };
    })
  );
}

async function getTop10Zen(): Promise<LeaderboardEntry[]> {
  const entries = await redis.zRange(REDIS_KEYS.zenLeaderboard, 0, 9, {
    reverse: true,
    by: 'rank',
  });

  return Promise.all(
    entries.map(async (entry, index) => {
      const { username } = parseLeaderboardMember(entry.member);
      const blitzScore = await redis.zScore(REDIS_KEYS.blitzLeaderboard, entry.member);
      return {
        member: entry.member,
        username,
        score: entry.score,
        rank: index + 1,
        totalPopped: entry.score,
        highScore: blitzScore,
      };
    })
  );
}

async function getBlitzPlayerStats(
  userId: string,
  username: string
): Promise<{ personalBest: number | null; rank: number | null }> {
  const member = formatLeaderboardMember(userId, username);
  const score = await redis.zScore(REDIS_KEYS.blitzLeaderboard, member);
  const personalBest = score !== undefined ? score : null;
  const rank = await getModeRank(REDIS_KEYS.blitzLeaderboard, member);
  return { personalBest, rank };
}

async function getZenPlayerStats(
  userId: string,
  username: string
): Promise<{ rank: number | null }> {
  const member = formatLeaderboardMember(userId, username);
  const rank = await getModeRank(REDIS_KEYS.zenLeaderboard, member);
  return { rank };
}

async function syncZenLeaderboard(
  userId: string,
  username: string,
  lifetimePops: number
): Promise<void> {
  if (lifetimePops <= 0) return;
  const member = formatLeaderboardMember(userId, username);
  await redis.zAdd(REDIS_KEYS.zenLeaderboard, { member, score: lifetimePops });
}

api.get('/init', async (c) => {
  const userId = context.userId;
  if (!userId) {
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'User context unavailable' },
      401
    );
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? 'player';
    const [lifetimePops, top10Blitz, top10Zen, blitzStats, zenStats, highestComboBlitz] =
      await Promise.all([
        getLifetimePops(userId),
        getTop10Blitz(),
        getTop10Zen(),
        getBlitzPlayerStats(userId, username),
        getZenPlayerStats(userId, username),
        getHighestCombo(userId),
      ]);

    const response: InitDataResponse = {
      type: 'INIT_DATA',
      username,
      lifetimePops,
      personalBestBlitz: blitzStats.personalBest,
      blitzRank: blitzStats.rank,
      zenRank: zenStats.rank,
      highestComboBlitz,
      top10Blitz,
      top10Zen,
    };

    return c.json(response);
  } catch (error) {
    console.error('Init failed:', error);
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'Failed to load player data' },
      500
    );
  }
});

api.post('/sync-pops', async (c) => {
  const userId = context.userId;
  if (!userId) {
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'User context unavailable' },
      401
    );
  }

  try {
    const body = (await c.req.json()) as SyncPopsRequest;
    const count = Math.min(
      API_LIMITS.maxSyncPopsPerRequest,
      Math.max(0, Math.floor(body.count))
    );
    const username = (await reddit.getCurrentUsername()) ?? 'player';

    if (count === 0) {
      const lifetimePops = await getLifetimePops(userId);
      const response: SyncPopsResponse = {
        type: 'SYNC_POPS',
        lifetimePops,
      };
      return c.json(response);
    }

    const lifetimePops = await redis.hIncrBy(
      REDIS_KEYS.userStats,
      userId,
      count
    );

    await syncZenLeaderboard(userId, username, lifetimePops);

    const response: SyncPopsResponse = {
      type: 'SYNC_POPS',
      lifetimePops,
    };
    return c.json(response);
  } catch (error) {
    console.error('Sync pops failed:', error);
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'Failed to sync lifetime pops' },
      500
    );
  }
});

api.post('/submit-score', async (c) => {
  const userId = context.userId;
  if (!userId) {
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'User context unavailable' },
      401
    );
  }

  try {
    const body = (await c.req.json()) as SubmitScoreRequest;
    const score = Math.min(
      API_LIMITS.maxBlitzScore,
      Math.max(0, Math.floor(body.score))
    );
    const maxCombo = Math.min(
      API_LIMITS.maxCombo,
      Math.max(1, Math.floor(body.maxCombo ?? 1))
    );
    const username = (await reddit.getCurrentUsername()) ?? 'player';
    const member = formatLeaderboardMember(userId, username);

    const previousScore = await redis.zScore(REDIS_KEYS.blitzLeaderboard, member);
    const previousBest = previousScore !== undefined ? previousScore : null;
    let isHighScore = false;

    if (previousScore === undefined || score > previousScore) {
      await redis.zAdd(REDIS_KEYS.blitzLeaderboard, { member, score });
      isHighScore = true;
    }

    const [top10Blitz, stats, highestComboBlitz] = await Promise.all([
      getTop10Blitz(),
      getBlitzPlayerStats(userId, username),
      updateHighestCombo(userId, maxCombo),
    ]);

    const response: SubmitScoreResponse = {
      type: 'SUBMIT_SCORE',
      score,
      isHighScore,
      previousBest,
      rank: stats.rank,
      highestComboBlitz,
      top10Blitz,
    };
    return c.json(response);
  } catch (error) {
    console.error('Submit score failed:', error);
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'Failed to submit blitz score' },
      500
    );
  }
});

api.get('/leaderboard', async (c) => {
  const userId = context.userId;
  if (!userId) {
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'User context unavailable' },
      401
    );
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? 'player';
    const [top10Blitz, top10Zen, stats, zenStats, lifetimePops] = await Promise.all([
      getTop10Blitz(),
      getTop10Zen(),
      getBlitzPlayerStats(userId, username),
      getZenPlayerStats(userId, username),
      getLifetimePops(userId),
    ]);

    const response: LeaderboardResponse = {
      type: 'LEADERBOARD',
      top10Blitz,
      top10Zen,
      personalBestBlitz: stats.personalBest,
      blitzRank: stats.rank,
      zenRank: zenStats.rank,
      lifetimePops,
    };

    return c.json(response);
  } catch (error) {
    console.error('Leaderboard fetch failed:', error);
    return c.json<ErrorResponse>(
      { type: 'ERROR', message: 'Failed to load leaderboard' },
      500
    );
  }
});
