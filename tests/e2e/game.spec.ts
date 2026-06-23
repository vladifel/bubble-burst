import { test, expect } from '@playwright/test';

const initPayload = {
  type: 'INIT_DATA',
  username: 'testplayer',
  lifetimePops: 1450,
  personalBestBlitz: 900,
  blitzRank: 1,
  zenRank: 2,
  highestComboBlitz: 8,
  top10Blitz: [{ member: 't2_test:testplayer', username: 'testplayer', score: 900, rank: 1, totalPopped: 1450, highScore: 900 }],
  top10Zen: [{ member: 't2_test:testplayer', username: 'testplayer', score: 1450, rank: 1, totalPopped: 1450 }],
};

async function mockBackend(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/init', async (route) => {
    await route.fulfill({ json: initPayload });
  });
  await page.route('**/api/sync-pops', async (route) => {
    await route.fulfill({
      json: { type: 'SYNC_POPS', lifetimePops: 1500 },
    });
  });
  await page.route('**/api/submit-score', async (route) => {
    await route.fulfill({
      json: {
        type: 'SUBMIT_SCORE',
        score: 1200,
        isHighScore: true,
        previousBest: 900,
        rank: 1,
        highestComboBlitz: 10,
        top10Blitz: [
          { member: 't2_test:testplayer', username: 'testplayer', score: 1200, rank: 1, totalPopped: 1450, highScore: 1200 },
        ],
      },
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockBackend(page);
  await page.goto('/game.html');
});

test('loads gate screen with init data', async ({ page }) => {
  await expect(page.locator('.gate-brand')).toHaveText(/Bubble Burst/i);
  await expect(page.getByRole('button', { name: /Zen Mode/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Blitz Mode/i })).toBeVisible();
  await expect(page.getByText(/1,450 XP/i)).toBeVisible();
  await expect(page.getByText(/Puzzle/i)).toHaveCount(0);
  await expect(page.locator('.screen-gate .hub-bottomnav-wrap')).toHaveCount(0);
});

test('uses the Stitch app icon on the gate', async ({ page }) => {
  const icon = page.locator('.gate-hero-bubble');
  await expect(icon).toBeVisible();
  await expect(icon).toHaveAttribute('src', /\/assets\/icon\.png$/);
});

test('starts zen mode from gate zen button', async ({ page }) => {
  await page.getByRole('button', { name: /Zen Mode/i }).click();
  await expect(page.getByText('Zen Mode')).toBeVisible();
  await expect(page.locator('.bubble.intact')).toHaveCount(36);
});

test('uses 5x5 grid on mobile zen mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Zen Mode/i }).click();
  await expect(page.locator('.bubble.intact')).toHaveCount(25);
});

test('shows blitz hud with timer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Blitz Mode/i }).click();
  await expect(page.getByText(/COMBO X1/i)).toBeVisible();
  await expect(page.getByText('1:00')).toBeVisible();
});

test('opens settings overlay from gate', async ({ page }) => {
  await page.locator('.gate-icon-btn.gate-desktop-only[title="Settings"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: /Close/i })).toBeVisible();
});

test('opens settings overlay from gate on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.gate-icon-btn.gate-mobile-only[title="Settings"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('opens stats screen from gate profile', async ({ page }) => {
  await page.locator('.gate-profile.gate-desktop-only[title="My Stats"]').click();
  await expect(page.getByRole('heading', { name: /Player Profile & Stats/i })).toBeVisible();
  await expect(page.locator('.stats-page-desktop').getByText(/Lifetime Popped/i)).toBeVisible();
  await page.getByRole('button', { name: /Go back/i }).click();
  await expect(page.locator('.gate-mode-btn').first()).toBeVisible();
});

test('exposes app icon asset', async ({ page }) => {
  const response = await page.request.get('/assets/icon.png');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('image');
});
