# Bubble Burst

![Bubble Burst home screen with Zen Mode and Blitz Mode buttons](https://raw.githubusercontent.com/vladifel/bubble-burst/main/docs/game-screenshot.png)

**Bubble Burst** is a bubble-matching arcade game built for Reddit with [Devvit](https://developers.reddit.com/). Players pop connected bubbles of the same color inside a subreddit post — no external site or download required.

## What this app does

Bubble Burst adds an interactive game post to a subreddit. Each post embeds the full game inline. Players can:

- **Zen Mode** — pop bubbles at their own pace; lifetime progress is saved
- **Blitz Mode** — score as many points as possible in 60 seconds with combo multipliers
- **Player Stats** — view lifetime pops, highest combo, and recent activity

Scores and stats are stored per Reddit user via Devvit Redis.

## How to start playing (for reviewers)

1. **Install** the app on a test subreddit (or open an existing Bubble Burst post).
2. **Open a Bubble Burst post** in the feed or post detail page.
3. The **game home screen loads inline** in the post with two large buttons:
   - **Zen Mode** — tap to start a relaxed session
   - **Blitz Mode** — tap to start a timed score run
4. **Pop bubbles** by tapping or dragging through connected same-color bubbles.
5. Optional: tap the **profile icon** (top right) for stats, or **settings** for audio/haptics.

### For moderators setting up the app

1. Install **Bubble Burst** on your subreddit.
2. On install, the app auto-creates an intro post — open that post to play immediately.
3. Or use the subreddit menu: **Create Bubble Burst post** to publish additional game posts.

### Playtest link

`https://www.reddit.com/r/bubble_bursts_dev/?playtest=bubble-bursts`

## Gameplay details

1. Open any Bubble Burst post — the home screen appears with **Zen Mode** and **Blitz Mode**.
2. Pick a mode to enter the bubble grid.
3. Tap or drag through adjacent bubbles of the same color to pop them. Larger chains build combos in Blitz.
4. In Blitz, the timer counts down from 60 seconds; your score is submitted when time runs out.
5. In Zen, return to the home screen to sync your lifetime pops.
6. Open **Player Stats** from the profile icon to see lifetime pops, highest combo, and activity.

## Features

- Two game modes — Zen (relaxed) and Blitz (timed)
- Combo system for Blitz scoring
- Per-user stats and leaderboards (Blitz high scores, Zen lifetime pops)
- Responsive layout for Reddit inline embeds and expanded desktop view
- Settings overlay for audio and haptics

## Development

### Requirements

- Node.js ≥ 22.2
- A [Reddit developer account](https://developers.reddit.com/)

### Setup

```bash
npm install
npm run login
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Playtest against your dev subreddit |
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

## Privacy & Terms

- [Privacy Policy](https://vladifel.github.io/bubble-burst/privacy-policy.html)
- [Terms and Conditions](https://vladifel.github.io/bubble-burst/terms-and-conditions.html)

## License

BSD-3-Clause
