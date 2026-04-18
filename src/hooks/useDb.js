import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

/* ------------------------------------------------------------------ */
/* date helpers (kept here so components have a single import surface) */
/* ------------------------------------------------------------------ */
export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function fmtDate(d) {
  return new Date(d).toISOString().slice(0, 10)
}

export function daysSince(dateStr) {
  return Math.floor((new Date(todayKey()) - new Date(dateStr)) / 86400000)
}

/* ------------------------------------------------------------------ */
/* tasks                                                               */
/* ------------------------------------------------------------------ */

/**
 * Returns `{ [taskId]: boolean }` for the given date. Reactive — updates
 * whenever the underlying rows change.
 */
export function useTasksForDate(date) {
  return useLiveQuery(
    async () => {
      const rows = await db.tasks.where('date').equals(date).toArray()
      const map = {}
      for (const r of rows) map[r.taskId] = !!r.done
      return map
    },
    [date],
    {},
  )
}

export async function toggleTask(date, taskId) {
  const existing = await db.tasks.get([date, taskId])
  await db.tasks.put({ date, taskId, done: !existing?.done })
}

/**
 * Returns `{ [date]: { [taskId]: boolean } }` for the whole table.
 * Used by the streak calculation on the Stats tab.
 */
export function useTasksByDate() {
  return useLiveQuery(
    async () => {
      const rows = await db.tasks.toArray()
      const byDate = {}
      for (const r of rows) {
        if (!byDate[r.date]) byDate[r.date] = {}
        byDate[r.date][r.taskId] = !!r.done
      }
      return byDate
    },
    [],
    {},
  )
}

/* ------------------------------------------------------------------ */
/* notes                                                               */
/* ------------------------------------------------------------------ */

export function useNote(date) {
  return useLiveQuery(
    async () => (await db.notes.get(date))?.text ?? '',
    [date],
    '',
  )
}

/**
 * Whole-notes map keyed by date — used by the journal-streak calculation.
 */
export function useNotesByDate() {
  return useLiveQuery(
    async () => {
      const rows = await db.notes.toArray()
      const map = {}
      for (const r of rows) map[r.date] = r.text || ''
      return map
    },
    [],
    {},
  )
}

export async function setNote(date, text) {
  if (text && text.length > 0) {
    await db.notes.put({ date, text })
  } else {
    await db.notes.delete(date)
  }
}

/* ------------------------------------------------------------------ */
/* scorecard                                                           */
/* ------------------------------------------------------------------ */

/**
 * Returns a map `{ "<date>_<habitIdx>": boolean }` restricted to the
 * seven dates passed in. Matches the legacy key shape used by the
 * Scorecard component to keep its render logic unchanged.
 */
export function useScorecardWeek(dates) {
  const key = dates.join(',')
  return useLiveQuery(
    async () => {
      const rows = await db.scorecard.where('date').anyOf(dates).toArray()
      const map = {}
      for (const r of rows) map[`${r.date}_${r.habitIdx}`] = !!r.done
      return map
    },
    [key],
    {},
  )
}

export async function toggleScorecard(date, habitIdx) {
  const existing = await db.scorecard.get([date, habitIdx])
  await db.scorecard.put({ date, habitIdx, done: !existing?.done })
}

/* ------------------------------------------------------------------ */
/* stats (saved daily logs)                                            */
/* ------------------------------------------------------------------ */

/**
 * Returns `{ [date]: { weight, sleep, pain, protein, study } }`.
 */
export function useStatsByDate() {
  return useLiveQuery(
    async () => {
      const rows = await db.stats.toArray()
      const map = {}
      for (const r of rows) {
        const { date, ...vals } = r
        map[date] = vals
      }
      return map
    },
    [],
    {},
  )
}

/* ------------------------------------------------------------------ */
/* statsDrafts (in-progress input values, preserved between visits)    */
/* ------------------------------------------------------------------ */

export function useStatsDraft(date) {
  return useLiveQuery(
    async () => {
      const row = await db.statsDrafts.get(date)
      if (!row) return {}
      // eslint-disable-next-line no-unused-vars
      const { date: _d, ...vals } = row
      return vals
    },
    [date],
    {},
  )
}

export async function setStatsDraft(date, values) {
  await db.statsDrafts.put({ date, ...values })
}

/**
 * Promote the current draft to the permanent `stats` table
 * (used when the user clicks "Save Today's Log").
 */
export async function commitStatsDraft(date, values) {
  await db.stats.put({ date, ...values })
}

/* ------------------------------------------------------------------ */
/* mental responses                                                    */
/* ------------------------------------------------------------------ */

/** { [taskId]: string } for a single date. */
export function useMentalResponsesForDate(date) {
  return useLiveQuery(
    async () => {
      const rows = await db.mentalResponses.where('date').equals(date).toArray()
      const map = {}
      for (const r of rows) map[r.taskId] = r.response || ''
      return map
    },
    [date],
    {},
  )
}

/** { [date]: { [taskId]: string } } — full history for the Mind Log. */
export function useMentalResponsesByDate() {
  return useLiveQuery(
    async () => {
      const rows = await db.mentalResponses.toArray()
      const byDate = {}
      for (const r of rows) {
        if (!r.response) continue
        if (!byDate[r.date]) byDate[r.date] = {}
        byDate[r.date][r.taskId] = r.response
      }
      return byDate
    },
    [],
    {},
  )
}

export async function setMentalResponse(date, taskId, response) {
  if (response && response.trim()) {
    await db.mentalResponses.put({ date, taskId, response })
  } else {
    await db.mentalResponses.delete([date, taskId])
  }
}
