# Bubble Burst

**Tap to pop your stress away.**

Bubble Burst is a Reddit Devvit game where you clear colorful bubble grids, build combos, and chase high scores — right inside your favorite subreddit.

## How to Play

1. Open a Bubble Burst post in your subreddit.
2. Tap **Start**, then pick a mode:
   - **Zen Mode** — relax and pop at your own pace. Lifetime pops sync when you return to the menu.
   - **Blitz Mode** — race the 60-second clock, chain combos, and submit your best score.
3. Drag or tap connected bubbles of the same color to pop them. Bigger chains mean higher combos.
4. Tap your profile icon to view **Player Stats** — lifetime pops, highest combo, activity, and recent sessions.

## Features

- **Two game modes** — chill Zen sessions or timed Blitz runs
- **Combo system** — chain pops to multiply your score in Blitz
- **Player stats** — lifetime pops, highest combo, levels cleared, and activity charts
- **Responsive layout** — tuned for Reddit's inline embed (512px) on mobile and expanded desktop views
- **Settings** — toggle audio and haptics from the gate or in-game pause menu

## For Subreddit Moderators

After installing Bubble Burst:

1. Use **Create Bubble Burst post** from the subreddit menu to publish a game post.
2. On first install, the app automatically creates an intro post.
3. Playtest before going live: `https://www.reddit.com/r/bubble_bursts_dev/?playtest=bubble-bursts`

## Development

### Requirements

- Node.js ≥ 22.2
- A [Reddit developer account](https://developers.reddit.com/)

### Setup

```bash
npm install
npm run login    # Devvit CLI login
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Playtest locally against your dev subreddit |
| `npm run build` | Production build |
| `npm run deploy` | Type-check, build, and upload to Reddit |
| `npm run launch` | Deploy and publish to the App Directory |
| `npm run test:all` | Run unit and e2e tests |

### Project structure

```
src/client/   Game UI, engine, and screens
src/server/   Devvit API routes (scores, stats, Redis)
src/shared/   Shared types and constants
public/       Static assets (icons, backgrounds)
assets/       App marketing icon for Devvit
```

## License

BSD-3-Clause
