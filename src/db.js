import Dexie from 'dexie'

/**
 * Achilles Recovery — local database (IndexedDB via Dexie).
 *
 * Schema notes
 * ------------
 * tasks         one row per (date, taskId) checkbox. Compound PK [date+taskId]
 *               so we can upsert a single checkbox without reading the day first.
 *
 * notes         one row per date. PK = date (ISO yyyy-mm-dd).
 *
 * scorecard     one row per (date, habitIdx). Compound PK [date+habitIdx].
 *
 * stats         one row per date with the *saved* daily metrics
 *               (weight, sleep, pain, protein, study). PK = date.
 *
 * statsDrafts   one row per date holding the in-progress input values
 *               before the user clicks "Save Today's Log". PK = date.
 *
 * meta          misc key/value table — currently used for the one-time
 *               localStorage migration flag. PK = key.
 */
export const db = new Dexie('achilles')

db.version(1).stores({
  tasks:       '[date+taskId], date, taskId',
  notes:       'date',
  scorecard:   '[date+habitIdx], date, habitIdx',
  stats:       'date',
  statsDrafts: 'date',
  meta:        'key',
})
