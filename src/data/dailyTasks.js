// Shared task / category configuration used by both the day view and
// the calendar. Centralized here so adding a new category (or a new
// daily-task data file) means editing one place.

import M1_TASKS from './month1Tasks'
import PRE_SURGERY_TASKS from './preSurgeryTasks'
import { PHASES } from './phases'

/**
 * All daily-task entries keyed by ISO date.
 * Pre-op entries first; if a date ever existed in both, M1 would win.
 */
export const DAILY_TASKS = { ...PRE_SURGERY_TASKS, ...M1_TASKS }

/**
 * Category configuration. `prefix` namespaces taskIds across categories
 * so checkboxes never collide (p0, s0, l0, m0 are distinct rows).
 * `color` is used by the calendar's completion bars.
 */
export const CATEGORIES = [
  { key: 'physical',  prefix: 'p', icon: '🏥', title: 'PT / Physical',         color: '#E74C3C', isMental: false },
  { key: 'study',     prefix: 's', icon: '📚', title: 'Study / Professional',  color: '#9B59B6', isMental: false },
  { key: 'logistics', prefix: 'l', icon: '📦', title: 'Logistics',             color: '#E67E22', isMental: false },
  { key: 'mental',    prefix: 'm', icon: '🧠', title: 'Mental + Personal',     color: '#27AE60', isMental: true  },
]

export function getPhaseFor(date) {
  return PHASES.find(p => date >= p.start && date <= p.end) || null
}

/**
 * Build the section list for a given date. Prefers an explicit per-day
 * record from DAILY_TASKS; otherwise falls back to the active phase's
 * goals (mapped into the same physical/study/mental category shape).
 */
export function buildSections(date) {
  const dayData = DAILY_TASKS[date]
  if (dayData) {
    return CATEGORIES
      .filter(c => Array.isArray(dayData[c.key]) && dayData[c.key].length)
      .map(c => ({ ...c, items: dayData[c.key] }))
  }

  const phase = getPhaseFor(date)
  if (phase) {
    const goals = phase.goals
    const mapped = {
      physical:  goals.Physical || [],
      study:     goals.Professional || [],
      mental:    [...(goals.Mental || []), ...(goals.Personal || [])],
    }
    return CATEGORIES
      .filter(c => mapped[c.key] && mapped[c.key].length)
      .map(c => ({ ...c, items: mapped[c.key] }))
  }

  return []
}

/**
 * Compute per-section completion counts for a date given the
 * `{ [taskId]: boolean }` checkbox map. Returns `[{ key, color, done, total }]`
 * — one entry per section that exists for that day.
 */
export function getSectionProgress(date, checkedMap = {}) {
  return buildSections(date).map(s => ({
    key: s.key,
    color: s.color,
    done: s.items.filter((_, i) => checkedMap[s.prefix + i]).length,
    total: s.items.length,
  }))
}
