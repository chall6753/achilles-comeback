import { useState } from 'react'
import DayView from './DayView'
import { todayKey } from '../hooks/useDb'
import styles from './Calendar.module.css'

function toISO(d) {
  return d.toISOString().slice(0, 10)
}

function shiftDay(iso, delta) {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + delta)
  return toISO(d)
}

export default function Today() {
  const [date, setDate] = useState(todayKey)

  return (
    <div>
      <div className={styles.dayNav}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => setDate(todayKey())}
          disabled={date === todayKey()}
          style={date === todayKey() ? { opacity: 0, pointerEvents: 'none' } : {}}
        >
          ↩ Today
        </button>
        <div className={styles.dayNavArrows}>
          <button type="button" className={styles.arrowBtn} onClick={() => setDate(d => shiftDay(d, -1))}>‹</button>
          <span className={styles.dayNavLabel}>
            {new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </span>
          <button type="button" className={styles.arrowBtn} onClick={() => setDate(d => shiftDay(d, 1))}>›</button>
        </div>
      </div>
      <DayView date={date} />
    </div>
  )
}
