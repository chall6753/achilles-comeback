# Achilles Comeback — project context

This file gives Claude (and any human walking in cold) the load-bearing
context for the project. Read it before making non-trivial changes.

## What this is

A personal daily-tracker web app that Charlie uses every day during his
6-month Achilles recovery. It's two things at once:

1. **A real tool** he'll be checking off tasks in starting Apr 24, 2026.
2. **A learning project** for backend skills he's actively studying.

That dual purpose drives most architectural decisions — see "Plans" below.

## Surgery & timeline context

Charlie has Achilles surgery on **Apr 24, 2026**. The app must be working
on that date. Pre-op daily goals run Apr 18 → Apr 23, then Month 1 daily
goals (`src/data/month1Tasks.js`) carry through May 23. Beyond that the
app falls back to phase-level goals from `src/data/phases.js` until
per-day tasks are authored.

**Implication:** any change with deployment risk should land before
Apr 24, or be deferred to recovery (see DB Rebuild Plan below).

## Tech stack

- React 18 + Vite 5
- Dexie 4 (IndexedDB wrapper) for client-side persistence
- Chart.js for the Stats charts
- CSS modules per component
- No backend yet — everything runs in the browser

## Code map

```
src/
  App.jsx                 — top-level tab router (Today / Calendar / Timeline / Scorecard / Stats)
  main.jsx                — entry; runs the localStorage→Dexie migration before first render
  db.js                   — Dexie schema (tables: tasks, notes, scorecard, stats, statsDrafts, meta)
  migrate.js              — one-time localStorage→IndexedDB import, gated by meta flag
  hooks/
    useDb.js              — all Dexie-backed reactive hooks + date utilities (todayKey, daysSince)
  data/
    phases.js             — 6 recovery phases + scorecard habit categories
    month1Tasks.js        — day-by-day tasks for Apr 24 → May 23
    preSurgeryTasks.js    — day-by-day tasks for Apr 18 → Apr 23
    dailyTasks.js         — merges the above + CATEGORIES config + buildSections() helper
  components/
    DayView.jsx           — renders one day's tasks/notes; takes a `date` prop
    Today.jsx             — thin wrapper: <DayView date={todayKey()} />
    Calendar.jsx          — month grid; click a cell → DayView for that date
    Timeline.jsx          — phase-level overview
    Scorecard.jsx         — weekly habits grid
    Stats.jsx             — daily metric inputs + trend charts
    Header.jsx            — title + day-since-surgery counter
```

## Data model

All persistent data lives in IndexedDB via Dexie. Tables:

- **tasks** — `[date+taskId]` PK, `done` boolean. One row per checkbox per day.
- **notes** — `date` PK, `text`. One free-form note per day.
- **scorecard** — `[date+habitIdx]` PK. Weekly habits grid checkboxes.
- **stats** — `date` PK, fields: `weight, sleep, pain, protein, study`. Saved daily logs.
- **statsDrafts** — `date` PK, same shape. In-progress input values before "Save".
- **meta** — `key` PK. Currently just the migration flag.

### Task ID convention

Tasks within a day are positional. The `taskId` is `<prefix><index>` where
the prefix marks the category:

| Prefix | Category   |
|--------|------------|
| `p`    | physical   |
| `s`    | study      |
| `l`    | logistics  |
| `m`    | mental     |

So `p0` = the first physical task of that day. Different days reuse `p0`
for *that day's* first physical task — checkbox state is namespaced by
`[date+taskId]`, never confused.

### Adding new daily tasks

Edit `src/data/preSurgeryTasks.js` or `src/data/month1Tasks.js`. Each
entry shape: `{ label, badge, physical?: [], study?: [], logistics?: [], mental?: [] }`.
Only the categories present in a given day's record render — the UI is
data-driven via `CATEGORIES` in `src/data/dailyTasks.js`.

## Conventions worth knowing

- Date keys are ISO `YYYY-MM-DD` strings, generated via `todayKey()`.
  This currently uses **UTC** (`new Date().toISOString().slice(0, 10)`),
  so days flip at UTC midnight, not local. This is a known minor bug
  inherited from earlier code — don't fix it without coordinating; lots
  of existing data is keyed this way.
- Components use Dexie's `useLiveQuery` (via the hooks in `useDb.js`)
  for reactivity. Don't add direct `db.<table>.get()` calls inside
  components — go through the hooks so live updates work.
- CSS modules everywhere; no Tailwind, no global stylesheet beyond
  `index.css`.

## DB Rebuild Plan (decided Apr 18, 2026)

The current Dexie/IndexedDB setup ships through surgery day. **Starting
Week 2 of recovery (~May 1, 2026)** the data layer gets rebuilt on a
real backend:

- Node (Express or Fastify) + Postgres
- REST API in front of the database
- Real ORM — Drizzle preferred to stay in JS, OR pivot to .NET + EF Core
  to align with Charlie's study goals (he's actively learning C#/EF Core).
- Connectable from a SQL GUI (TablePlus / DBeaver / pgAdmin) — that was
  one of his explicit asks. He compared the experience he wanted to SSMS.
- React frontend talks to the backend via fetch — no more direct
  browser-storage access in components.

**Why a rebuild rather than just keeping Dexie:** Charlie wants
production-realistic backend architecture experience that maps to
enterprise patterns. Dexie is legitimate for browser-only apps but
doesn't teach SQL schema design, migrations, REST API design, or anything
inspectable by a real DB GUI. The rebuild directly reinforces his Month
1–2 study plan (HTTP, auth, EF Core, SQL).

**Migration path:** existing Dexie data should be exported and POSTed to
the new API in a one-time script — Charlie will have ~2 weeks of pre-op
+ early-recovery data he wants to keep continuity on for the stats charts.

## About Charlie

Backend-leaning developer. Comfortable with JS/React, actively studying:

- HTTP fundamentals, CORS, caching
- Auth flows (JWT, OIDC, OAuth 2.0, cookies vs tokens)
- MDS architecture (his work codebase)
- C# mastery, LINQ, EF Core internals
- SQL joins and indexing

Frame technical conversations toward enterprise backend patterns. He
prefers production-realistic choices over "what's easiest in the browser"
when timelines allow — and wants the tradeoff called out explicitly when
they don't.

## Common commands

```bash
npm install          # first time only
npm run dev          # local dev server (Vite)
npm run build        # production build into dist/
npm run preview      # serve the production build
```

## Known quirks / gotchas

- `todayKey()` uses UTC (see Conventions). Cosmetic-only impact.
- The pre-surgery splash screen in `DayView.jsx` only shows on the
  *actual* current day with no scheduled content — past/future empty
  days get a quieter "Nothing scheduled" state instead. If you change
  that branching, test all four cases: today/not-today × has-data/no-data.
- `Header.jsx` was previously truncated (missing closing tags); fixed
  in the same change that introduced Dexie. If you see the build fail
  there again, check that no tooling has stripped the file.
