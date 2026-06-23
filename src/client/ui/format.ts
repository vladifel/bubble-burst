export function scoreGrade(score: number): string {
  if (score >= 5000) return 'S';
  if (score >= 3000) return 'A';
  if (score >= 1500) return 'B';
  if (score >= 500) return 'C';
  return 'D';
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function formatCompactScore(score: number): string {
  if (score >= 1_000_000) {
    const millions = score / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (score >= 10_000) return `${Math.round(score / 1000)}K`;
  if (score >= 1000) return `${(score / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(score);
}

export function formatActivityPoints(score: number): string {
  const points = Math.max(50, Math.round(score / 100));
  if (points >= 1000) return `+${Math.round(points / 10) * 10}`;
  return `+${points}`;
}

export function formatTimer(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function comboFillPercent(multiplier: number, max = 10): number {
  return (multiplier / max) * 100;
}
