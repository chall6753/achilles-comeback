import { db } from './db'

const PREFIX = 'achilles_'
const MIGRATION_KEY = 'migratedFromLocalStorage_v1'

function readJSON(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * One-time copy of legacy localStorage data into the Dexie tables.
 * Safe to call on every app start — it short-circuits after the first
 * successful run via a flag in the `meta` table.
 *
 * After a successful migration we *intentionally* leave the old
 * localStorage keys in place. They act as a safety net in case the user
 * needs to roll back. They can be deleted later with a small cleanup pass.
 */
export async function migrateFromLocalStorage() {
  const flag = await db.meta.get(MIGRATION_KEY)
  if (flag?.value) return { migrated: false, reason: 'already-done' }

  const counts = { tasks: 0, notes: 0, scorecard: 0, stats: 0, drafts: 0 }

  // tasks: { [date]: { [taskId]: boolean } }
  const tasks = readJSON('tasks') || {}
  const taskRows = []
  for (const [date, byTask] of Object.entries(tasks)) {
    if (!byTask || typeof byTask !== 'object') continue
    for (const [taskId, done] of Object.entries(byTask)) {
      taskRows.push({ date, taskId, done: !!done })
    }
  }
  if (taskRows.length) {
    await db.tasks.bulkPut(taskRows)
    counts.tasks = taskRows.length
  }

  // notes: { [date]: string }
  const notes = readJSON('notes') || {}
  const noteRows = Object.entries(notes)
    .filter(([, text]) => typeof text === 'string')
    .map(([date, text]) => ({ date, text }))
  if (noteRows.length) {
    await db.notes.bulkPut(noteRows)
    counts.notes = noteRows.length
  }

  // scorecard: { "<date>_<habitIdx>": boolean }
  const sc = readJSON('scorecard') || {}
  const scRows = []
  for (const [key, done] of Object.entries(sc)) {
    const sep = key.lastIndexOf('_')
    if (sep < 0) continue
    const date = key.slice(0, sep)
    const habitIdx = Number(key.slice(sep + 1))
    if (!date || Number.isNaN(habitIdx)) continue
    scRows.push({ date, habitIdx, done: !!done })
  }
  if (scRows.length) {
    await db.scorecard.bulkPut(scRows)
    counts.scorecard = scRows.length
  }

  // stats: { [date]: { weight, sleep, pain, protein, study } }
  const stats = readJSON('statsData') || {}
  const statsRows = Object.entries(stats)
    .filter(([, vals]) => vals && typeof vals === 'object')
    .map(([date, vals]) => ({ date, ...vals }))
  if (statsRows.length) {
    await db.stats.bulkPut(statsRows)
    counts.stats = statsRows.length
  }

  // statsDrafts: each `achilles_inputs_<date>` key
  const draftRows = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith(PREFIX + 'inputs_')) continue
    const date = k.slice((PREFIX + 'inputs_').length)
    const vals = readJSON('inputs_' + date) || {}
    draftRows.push({ date, ...vals })
  }
  if (draftRows.length) {
    await db.statsDrafts.bulkPut(draftRows)
    counts.drafts = draftRows.length
  }

  await db.meta.put({
    key: MIGRATION_KEY,
    value: true,
    at: new Date().toISOString(),
    counts,
  })

  return { migrated: true, counts }
}
