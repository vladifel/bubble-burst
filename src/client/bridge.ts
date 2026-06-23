import type {
  InitDataResponse,
  SubmitScoreResponse,
  SyncPopsResponse,
} from '../shared/api';

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : '{}',
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Devvit web bridge — REST endpoints mirror the spec postMessage payloads. */
export async function fetchInitData(): Promise<InitDataResponse> {
  const response = await fetch('/api/init');
  if (!response.ok) {
    throw new Error(`Init failed: ${response.status}`);
  }
  return (await response.json()) as InitDataResponse;
}

export async function syncLifetimePops(count: number): Promise<SyncPopsResponse> {
  return postJson<SyncPopsResponse>('/api/sync-pops', { type: 'SYNC_POPS', count });
}

export async function submitBlitzScore(
  score: number,
  maxCombo: number
): Promise<SubmitScoreResponse> {
  return postJson<SubmitScoreResponse>('/api/submit-score', {
    type: 'SUBMIT_SCORE',
    score,
    maxCombo,
  });
}

export function sendMessage(payload: unknown): void {
  try {
    window.parent.postMessage(payload, '*');
  } catch {
    // Graceful offline / sandbox failure per spec
  }
}
