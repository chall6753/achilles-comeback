import { PHASES } from '../data/phases'
import { todayKey } from '../hooks/useStorage'
import styles from './Timeline.module.css'

function getPhaseStatus(p) {
  const t = todayKey()
  if (t > p.end)   return 'past'
  if (t >= p.start) return 'current'
  return 'future'
}

function getPhaseProgress(p) {
  const t = todayKey(), s = new Date(p.start), e = new Date(p.end), d = new Date(t)
  if (d < s) return 0
  if (d > e) return 100
  return Math.round((d - s) / (e - s) * 100)
}

function getOverallProgress() {
  const s = new Date(PHASES[0].start), e = new Date(PHASES.at(-1).end), t = new Date(todayKey())
  if (t < s) return 0
  if (t > e) return 100
  return Math.round((t - s) / (e - s) * 100)
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Timeline() {
  const overall = getOverallProgress()
  const current = PHASES.find(p => getPhaseStatus(p) === 'current') || PHASES[0]

  return (
    <div>
      {/* Overall progress */}
      <div className={styles.overallCard}>
        <div className={styles.overallTop}>
          <div>
            <div className={styles.overallTitle}>6-Month Comeback Arc</div>
            <div className={styles.overallSub}>Day {Math.max(0, Math.floor((new Date(todayKey()) - new Date(PHASES[0].start)) / 86400000))} of 183</div>
          </div>
          <div className={styles.overallPct}>{overall}%</div>
        </div>
        <div className={styles.bar}><div className={styles.barFill} style={{ width: overall + '%', background: '#E94560' }} /></div>
      </div>

      {/* Phase cards */}
      <div className={styles.phaseGrid}>
        {PHASES.map(p => {
          const status = getPhaseStatus(p)
          const prog   = getPhaseProgress(p)
          return (
            <div key={p.id} className={`${styles.phaseCard} ${styles[status]}`} style={{ borderColor: status === 'current' ? p.color : 'transparent', background: p.color + '12' }}>
              <div className={styles.phaseShort} style={{ color: p.color }}>{p.short}</div>
              <div className={styles.phaseName}>{p.name}</div>
              <div className={styles.phaseDates}>{fmt(p.start)} – {fmt(p.end)}</div>
              <div className={styles.phaseWin}>"{p.win}"</div>
              <div className={styles.bar} style={{ marginBottom: 10 }}>
                <div className={styles.barFill} style={{ width: prog + '%', background: p.color }} />
              </div>
              <span className={`${styles.statusBadge} ${styles['badge_' + status]}`} style={status === 'current' ? { background: p.color, color: '#fff' } : {}}>
                {status === 'current' ? '▶ Current' : status === 'past' ? '✓ Complete' : 'Upcoming'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current phase goals */}
      <div className={styles.goalsSection}>
        <div className={styles.goalsSectionTitle}>Current Phase Goals — {current.name}</div>
        <div className={styles.goalsGrid}>
          {Object.entries(current.goals).map(([cat, items]) => (
            <div key={cat} className={styles.goalCard}>
              <div className={styles.goalCat} style={{ color: current.color }}>{cat}</div>
              {items.map((g, i) => <div key={i} className={styles.goalItem}>• {g}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
