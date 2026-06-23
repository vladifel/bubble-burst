import { describe, expect, it } from 'vitest';
import {
  comboFillPercent,
  formatScore,
  formatTimer,
  scoreGrade,
} from '../../src/client/ui/format';

describe('ui/format', () => {
  it('grades scores into letter buckets', () => {
    expect(scoreGrade(6000)).toBe('S');
    expect(scoreGrade(3500)).toBe('A');
    expect(scoreGrade(1600)).toBe('B');
    expect(scoreGrade(700)).toBe('C');
    expect(scoreGrade(100)).toBe('D');
  });

  it('formats score with grouping separators', () => {
    expect(formatScore(1450).replace(/\D/g, '')).toBe('1450');
  });

  it('formats timer as m:ss', () => {
    expect(formatTimer(62_500)).toBe('1:03');
    expect(formatTimer(0)).toBe('0:00');
  });

  it('computes combo bar fill percent', () => {
    expect(comboFillPercent(5)).toBe(50);
    expect(comboFillPercent(10, 10)).toBe(100);
  });
});
