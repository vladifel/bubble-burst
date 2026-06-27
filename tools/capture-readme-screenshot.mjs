import { chromium } from '@playwright/test';
import { createServer } from 'http';
import handler from 'serve-handler';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', 'client');
const outDir = join(root, 'docs');
const outFile = join(outDir, 'game-screenshot.png');

const initPayload = {
  type: 'INIT_DATA',
  username: 'testplayer',
  lifetimePops: 1450,
  personalBestBlitz: 900,
  blitzRank: 1,
  zenRank: 2,
  highestComboBlitz: 8,
  top10Blitz: [],
  top10Zen: [],
};

const server = createServer((req, res) =>
  handler(req, res, { public: dist, cleanUrls: false })
);

await new Promise((resolve) => server.listen(4174, '127.0.0.1', resolve));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 512 } });

await page.route('**/api/init', async (route) => {
  await route.fulfill({ json: initPayload });
});

await page.goto('http://127.0.0.1:4174/game.html', { waitUntil: 'networkidle' });
await page.waitForSelector('.gate-mode-btn');

mkdirSync(outDir, { recursive: true });
await page.screenshot({ path: outFile, fullPage: false });

await browser.close();
server.close();

console.log(`Wrote ${outFile}`);
