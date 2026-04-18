import { PHASES, SURGERY_DATE } from '../data/phases'
import { daysSince, todayKey } from '../hooks/useDb'
import styles from './Header.module.css'

function getCurrentPhase() {
  const t = todayKey()
  return PHASES.find(p => t >= p.start && t <= p.end) || null
}

export default function Header() {
  const phase = getCurrentPhase()
  const days  = daysSince(SURGERY_DATE)
  const date  = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.title}>🏆 ACHILLES COMEBACK</span>
        {phase && (
          <span className={styles.badge} style={{ background: phase.color + '22', color: phase.color, border: `1px solid ${phase.color}44` }}>
            {phase.name}
          </span>
        )}
      </div>
      <div className={styles.center}>
        <div className={styles.dayCount}>{Math.abs(days)}</div>
        <div className={styles.dayLabel}>{days >= 0 ? 'Days Since Surgery' : 'Days Until Surgery'}</div>
      </div>
      <div className={styles.right}>
        <div className={styles.date}>{date}</div>
        <div className={styles.mantra}>This is temporary. This is training. I will come back upgraded.</div>
      </div>
    </header>
  )
}
