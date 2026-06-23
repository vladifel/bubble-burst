import { describe, expect, it } from 'vitest';
import {
  computeBlitzRank,
  formatLeaderboardMember,
  parseLeaderboardMember,
  REDIS_KEYS,
} from '../../src/shared/api';

describe('shared/api', () => {
  it('defines stable redis keys', () => {
    expect(REDIS_KEYS.userStats).toBe('user_stats');
    expect(REDIS_KEYS.blitzLeaderboard).toBe('leaderboard:blitz');
    expect(REDIS_KEYS.zenLeaderboard).toBe('leaderboard:zen');
  });

  it('computes 1-based blitz rank from ascending redis rank', () => {
    expect(computeBlitzRank(4, 3)).toBe(1);
    expect(computeBlitzRank(4, 0)).toBe(4);
    expect(computeBlitzRank(1, 0)).toBe(1);
  });

  it('formats and parses leaderboard members', () => {
    const member = formatLeaderboardMember('t2_abc', 'spez');
    expect(member).toBe('t2_abc:spez');
    expect(parseLeaderboardMember(member)).toEqual({
      userId: 't2_abc',
      username: 'spez',
    });
  });

  it('falls back when member has no username separator', () => {
    expect(parseLeaderboardMember('t2_only')).toEqual({
      userId: 't2_only',
      username: 'player',
    });
  });

  it('handles empty username segment', () => {
    expect(parseLeaderboardMember('t2_abc:')).toEqual({
      userId: 't2_abc',
      username: 'player',
    });
  });
});
