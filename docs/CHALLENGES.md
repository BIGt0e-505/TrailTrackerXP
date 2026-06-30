# Challenge System

## Current Architecture (pre-selectable-challenges)

### Challenge Definitions

Challenge templates are defined in `utils/gamification.js`:

```js
const CHALLENGE_TEMPLATES = [
  { id: 'daily_distance',   type: 'distance',        period: 'daily',  targets: [2, 3, 5],           unit: 'km',         description: 'Walk/bike {target}km today' },
  { id: 'weekly_distance',  type: 'distance',        period: 'weekly', targets: [10, 15, 20, 25],    unit: 'km',         description: 'Travel {target}km this week' },
  { id: 'daily_activity',   type: 'count',           period: 'daily',  targets: [1],                  unit: 'activities', description: 'Complete an activity today' },
  { id: 'weekly_activities',type: 'count',           period: 'weekly', targets: [3, 4, 5],            unit: 'activities', description: 'Complete {target} activities this week' },
  { id: 'streak',           type: 'streak',          period: 'weekly', targets: [3, 5, 7],            unit: 'days',       description: 'Keep a {target}-day streak going' },
  { id: 'long_activity',    type: 'single_distance', period: 'weekly', targets: [3, 5, 7],            unit: 'km',         description: 'Complete a single {target}km+ activity' },
  { id: 'duration',         type: 'duration',        period: 'weekly', targets: [30, 45, 60],         unit: 'mins',       description: 'Be active for {target} minutes in one go' },
];
```

### Random Challenge Generation

`generateChallenges(currentStats)` picks 3 random templates, selects a random target from each template's `targets` array, and creates challenge objects with:
- `id`: `{templateId}_{timestamp}_{index}`
- `createdAt`, `expiresAt` (daily = end of today, weekly = end of week)
- `progress: 0`, `completed: false`

### When Challenges Are Generated

In `processActivity()` (called on each new activity save):
1. If no challenges exist, or all are completed/expired, or the day has changed since last generation → generate new challenges.
2. `lastChallengeGeneration` timestamp is stored in gamification state.

Also in `StatsScreen.js` `loadGamification()` (on screen focus):
1. Same check — if challenges need regeneration, generate them.
2. Progress is updated via `updateChallengeProgress()`.

### Progress Calculation

`updateChallengeProgress(challenges, activities, currentStreak)`:
- Filters activities by challenge period (daily = today, weekly = this week).
- For `distance`: sum all activity distances in period.
- For `count`: count activities in period.
- For `streak`: use current streak value.
- For `single_distance`: max single activity distance in period.
- For `duration`: max single activity duration in period.
- Sets `completed = progress >= target`.

### XP and Rewards

- Activity XP: 10 base + 10/km + 1/min + 1/10m elevation + bonuses for long activities.
- Achievement XP: 50 per achievement, 500 for major achievements.
- Challenge XP: 25 bonus per challenge completed (added in `processActivity`).
- Challenge completion is marked with `rewarded: true` to prevent double-award.
- XP is persisted in `gamification.xp` in AsyncStorage (`@trail_tracker_gamification`) and also saved to file (`/activities/gamification.json`).

### Recalculation

`recalculateGamification(activities, cutoffDate)`:
- Rebuilds XP from scratch by replaying all activities.
- Re-checks all achievements.
- Updates challenge progress.
- Called when activities are deleted or modified.

### Storage

- **AsyncStorage**: `@trail_tracker_gamification` — primary store for gamification state (XP, level, achievements, challenges, stats, lastChallengeGeneration).
- **File storage**: `/activities/gamification.json` — backup/file-based copy.

### StatsScreen Display

- Challenges card on Stats overview tab.
- Full challenges view on "challenges" tab (activeTab state).
- Shows: description, progress/target, progress bar.
- Completed challenges show ✓ and "+25 XP earned".
- Expired challenges show ? with reduced opacity.

## Selectable Challenges (new feature)

### Design

- Users can manually select a challenge from the template pool.
- Selected challenge progress starts from `selectedAt` timestamp (not retroactive).
- Bonus XP awarded once on completion (50/100/250 by difficulty).
- A reward ledger persists completed challenge rewards to prevent double-award.
- Random challenges continue to work when no challenge is selected.

### State Model

```js
selectedChallenge: {
  templateId: "walk_5_miles",
  description: "Walk 5 miles",
  type: "distance",
  target: 5,
  unit: "km",
  bonusXp: 100,
  selectedAt: "2026-06-30T20:00:00.000Z",
  baseline: { distance: 0, duration: 0, elevation: 0, activityCount: 0 },
  completedAt: null,
  bonusXpAwarded: false,
}
```

### Reward Ledger

```js
challengeRewards: [
  { challengeId: "walk_5_miles", awardedAt: "...", xp: 100, source: "selected_challenge" }
]
```