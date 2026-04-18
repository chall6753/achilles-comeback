import { useState } from 'react'
import DayView from './DayView'
import { useTasksByDate, todayKey } from '../hooks/useDb'
import {
  DAILY_TASKS,
  getPhaseFor,
  getSectionProgress,
} from '../data/dailyTasks'
import styles from './Calendar.module.css'

const SURGERY = '2026-04-24'
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ---------- UTC-safe date helpers (match hooks/useDb.todayKey which uses UTC) */

function toISO(d) {
  return d.toISOString().slice(0, 10)
}

/**
 * Build a 6×7 grid (42 cells) covering the given month. Starts from the
 * Monday on or before the 1st of the month so the grid always begins on
 * Monday and always fills 6 rows.
 */
function buildMonthGrid(year, monthIdx) {
  const first = new Date(Date.UTC(year, monthIdx, 1))
  // Day-of-week for the 1st, 0 = Mon … 6 = Sun
  const startDow = (first.getUTCDay() + 6) % 7
  const start = new Date(first)
  start.setUTCDate(first.getUTCDate() - startDow)

  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    cells.push({
      iso: toISO(d),
      dayNum: d.getUTCDate(),
      inMonth: d.getUTCMonth() === monthIdx,
    })
  }
  return cells
}

/**
 * Initial month to display — month of today's date.
 */
function initialMonth() {
  const t = new Date(todayKey() + 'T00:00:00Z')
  return { year: t.getUTCFullYear(), monthIdx: t.getUTCMonth() }
}

function DayCell({ cell, tasksByDate, isToday, isSurgery, onSelect }) {
  const checked = tasksByDate[cell.iso] || {}
  const progress = getSectionProgress(cell.iso, checked)
  const hasContent = DAILY_TASKS[cell.iso] || getPhaseFor(cell.iso)

  return (
    <button
      type="button"
      className={[
        styles.cell,
        !cell.inMonth && styles.outOfMonth,
        isToday && styles.today,
        isSurgery && styles.surgery,
        !hasContent && styles.empty,
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect(cell.iso)}
    >
      <div className={styles.cellHeader}>
        <span className={styles.dayNum}>{cell.dayNum}</span>
        {isSurgery && <span className={styles.surgeryMark}>🏥</span>}
      </div>

      {/* Category completion bars — one per section that exists for this day */}
      {progress.length > 0 && (
        <div className={styles.bars}>
          {progress.map(p => {
            const pct = p.total > 0 ? (p.done / p.total) * 100 : 0
            return (
              <div key={p.key} className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: pct + '%', background: p.color }}
                />
              </div>
            )
          })}
        </div>
      )}
    </button>
  )
}

export default function Calendar() {
  const [{ year, monthIdx }, setMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState(null)
  const tasksByDate = useTasksByDate()

  function shiftDay(iso, delta) {
    const d = new Date(iso + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + delta)
    return toISO(d)
  }

  if (selectedDate) {
    return (
      <div>
        <div className={styles.dayNav}>
          <button type="button" className={styles.backBtn} onClick={() => setSelectedDate(null)}>
            ← Calendar
          </button>
          <div className={styles.dayNavArrows}>
            <button type="button" className={styles.arrowBtn} onClick={() => setSelectedDate(d => shiftDay(d, -1))}>‹</button>
            <span className={styles.dayNavLabel}>
              {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </span>
            <button type="button" className={styles.arrowBtn} onClick={() => setSelectedDate(d => shiftDay(d, 1))}>›</button>
          </div>
        </div>
        <DayView date={selectedDate} />
      </div>
    )
  }

  const cells = buildMonthGrid(year, monthIdx)
  const today = todayKey()
  const monthLabel = new Date(Date.UTC(year, monthIdx, 1))
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  function shiftMonth(delta) {
    setMonth(({ year, monthIdx }) => {
      const d = new Date(Date.UTC(year, monthIdx + delta, 1))
      return { year: d.getUTCFullYear(), monthIdx: d.getUTCMonth() }
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.monthNav}>
        <button type="button" onClick={() => shiftMonth(-1)}>← Prev</button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button type="button" onClick={() => shiftMonth(1)}>Next →</button>
      </div>

      <div className={styles.headerRow}>
        {DAY_NAMES.map(n => (
          <div key={n} className={styles.dayName}>{n}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map(cell => (
          <DayCell
            key={cell.iso}
            cell={cell}
            tasksByDate={tasksByDate}
            isToday={cell.iso === today}
            isSurgery={cell.iso === SURGERY}
            onSelect={setSelectedDate}
          />
        ))}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}><i style={{ background: '#E74C3C' }} /> Physical</span>
        <span className={styles.legendItem}><i style={{ background: '#9B59B6' }} /> Study</span>
        <span className={styles.legendItem}><i style={{ background: '#E67E22' }} /> Logistics</span>
        <span className={styles.legendItem}><i style={{ background: '#27AE60' }} /> Mental</span>
      </div>
    </div>
  )
}
