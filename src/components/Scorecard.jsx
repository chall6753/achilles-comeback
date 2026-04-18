import { useState } from 'react'
import { SCORECARD_HABITS } from '../data/phases'
import { useScorecardWeek, toggleScorecard } from '../hooks/useDb'
import styles from './Scorecard.module.css'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d)
    dd.setDate(d.getDate() + i)
    return dd.toISOString().slice(0, 10)
  })
}

export default function Scorecard() {
  const [weekOffset, setWeekOffset] = useState(0)

  const dates = getWeekDates(weekOffset)
  const sc = useScorecardWeek(dates)
  const label = `Week of ${new Date(dates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(dates[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  let rowIdx = 0

  return (
    <div className={styles.wrap}>
      <div className={styles.weekNav}>
        <button onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
        <span className={styles.weekLabel}>{label}</span>
        <button onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.habitCol}>Habit</th>
              {DAY_NAMES.map((d, i) => (
                <th key={d}>
                  {d}
                  <div className={styles.dateLabel}>
                    {new Date(dates[i]).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORECARD_HABITS.map(group => (
              <>
                <tr key={group.cat} className={styles.catRow}>
                  <td colSpan={8}>{group.cat}</td>
                </tr>
                {group.items.map(habit => {
                  const ri = rowIdx++
                  return (
                    <tr key={habit}>
                      <td className={styles.habitName}>{habit}</td>
                      {dates.map(date => {
                        const key = `${date}_${ri}`
                        const checked = !!sc[key]
                        return (
                          <td key={date} className={checked ? styles.checked : ''}>
                            <input type="checkbox" checked={checked} onChange={() => toggleScorecard(date, ri)} />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
