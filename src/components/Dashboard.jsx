import {
  useStatsByDate,
  useNotesByDate,
  useTasksByDate,
  useTasksForDate,
  todayKey,
  daysSince,
} from '../hooks/useDb'
import { PHASES } from '../data/phases'
import { buildSections } from '../data/dailyTasks'
import PRE_SURGERY from '../data/preSurgeryTasks'
import styles from './Dashboard.module.css'

const SURGERY = '2026-04-24'
const PRE_DAYS = Object.keys(PRE_SURGERY).sort()
const MANTRA = 'This is temporary. This is training. I will come back upgraded.'

const PHASE_MANTRAS = {
  1: 'Survive first. Everything else is secondary.',
  2: 'Discipline is doing it when you don\'t feel like it.',
  3: 'Slow is smooth. Smooth is fast.',
  4: 'You\'re not coming back — you\'re coming back better.',
  5: 'Trust the work. Trust the tendon. Trust yourself.',
  6: 'The comeback is always stronger than the setback.',
}

function calcStreak(todayISO, fn) {
  let streak = 0
  const d = new Date(todayISO)
  for (let i = 0; i < 90; i++) {
    const k = d.toISOString().slice(0, 10)
    if (fn(k)) streak++; else if (i > 0) break
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/* ── Pre-surgery hero ─────────────────────────────────────────────── */
function PreSurgeryHero({ today }) {
  const daysUntil = Math.abs(daysSince(SURGERY))
  const pastPrep  = PRE_DAYS.filter(d => d < today).length
  const pct       = Math.round(pastPrep / PRE_DAYS.length * 100)

  return (
    <div className={styles.hero} style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2C2C54 100%)' }}>
      <div className={styles.heroTop}>
        <div>
          <div className={styles.heroPhaseLabel} style={{ color: '#F39C12' }}>PRE-OP</div>
          <div className={styles.heroName}>Surgery Countdown</div>
          <div className={styles.heroWin}>"{MANTRA}"</div>
        </div>
        <div className={styles.heroDays}>
          <div className={styles.heroDayNum} style={{ color: '#F39C12' }}>{daysUntil}</div>
          <div className={styles.heroDayLabel}>days until surgery</div>
        </div>
      </div>

      <div className={styles.heroBarWrap}>
        <div className={styles.heroBarTrack}>
          <div className={styles.heroBarFill} style={{ width: pct + '%', background: '#F39C12' }} />
        </div>
        <div className={styles.heroBarMeta}>
          <span>Prep started Apr 18</span>
          <span>{pct}% of pre-op prep complete</span>
          <span>Surgery Apr 24</span>
        </div>
      </div>

      <div className={styles.heroMantra} style={{ borderColor: '#F39C1244' }}>
        {MANTRA}
      </div>
    </div>
  )
}

/* ── Recovery phase hero ──────────────────────────────────────────── */
function PhaseHero({ phase, today }) {
  const totalDays = Math.round((new Date(phase.end) - new Date(phase.start)) / 86400000)
  const daysIn    = Math.max(0, daysSince(phase.start))
  const daysLeft  = Math.max(0, Math.round((new Date(phase.end) - new Date(today)) / 86400000))
  const pct       = Math.min(100, Math.round(daysIn / totalDays * 100))

  return (
    <div className={styles.hero} style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)' }}>
      <div className={styles.heroTop}>
        <div>
          <div className={styles.heroPhaseLabel} style={{ color: phase.color }}>{phase.short} · {phase.name}</div>
          <div className={styles.heroName}>{phase.obj}</div>
          <div className={styles.heroWin}>"{phase.win}"</div>
        </div>
        <div className={styles.heroDays}>
          <div className={styles.heroDayNum} style={{ color: phase.color }}>{daysIn}</div>
          <div className={styles.heroDayLabel}>days in</div>
          <div className={styles.heroDaysSub}>{daysLeft} left</div>
        </div>
      </div>

      <div className={styles.heroBarWrap}>
        <div className={styles.heroBarTrack}>
          <div className={styles.heroBarFill} style={{ width: pct + '%', background: phase.color }} />
        </div>
        <div className={styles.heroBarMeta}>
          <span>Day {daysIn}</span>
          <span>{pct}% through this phase</span>
          <span>{daysLeft} days remain</span>
        </div>
      </div>

      <div className={styles.heroMantra} style={{ borderColor: phase.color + '44' }}>
        <span style={{ color: phase.color }}>"</span>
        {PHASE_MANTRAS[phase.id]}
        <span style={{ color: phase.color }}>"</span>
      </div>
    </div>
  )
}

/* ── Stat chip ────────────────────────────────────────────────────── */
function StatChip({ icon, value, label, color = '#E94560' }) {
  return (
    <div className={styles.chip}>
      <div className={styles.chipIcon}>{icon}</div>
      <div className={styles.chipNum} style={{ color }}>{value}</div>
      <div className={styles.chipLabel}>{label}</div>
    </div>
  )
}

/* ── Goal category card ───────────────────────────────────────────── */
function GoalCard({ cat, items, color }) {
  const CAT_ICONS = { Physical: '🏥', Mental: '🧠', Professional: '💻', Personal: '🌱' }
  return (
    <div className={styles.goalCard} style={{ borderTop: `3px solid ${color}` }}>
      <div className={styles.goalCat}>
        <span>{CAT_ICONS[cat] || '•'}</span>
        <span style={{ color }}>{cat}</span>
      </div>
      {items.map((g, i) => (
        <div key={i} className={styles.goalItem}>• {g}</div>
      ))}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────── */
export default function Dashboard() {
  const today     = todayKey()
  const statsData = useStatsByDate()
  const notes     = useNotesByDate()
  const tasks     = useTasksByDate()
  const todayTasks = useTasksForDate(today)

  const phase = PHASES.find(p => today >= p.start && today <= p.end) || null
  const isPreSurgery = today < SURGERY

  // Today's task completion
  const sections  = buildSections(today)
  const allItems  = sections.flatMap(s => s.items)
  const doneCount = sections.reduce((acc, s) => acc + s.items.filter((_, i) => todayTasks[s.prefix + i]).length, 0)
  const todayPct  = allItems.length > 0 ? Math.round(doneCount / allItems.length * 100) : 0

  // Streaks
  const taskStreak    = calcStreak(today, k => Object.values(tasks[k] || {}).some(v => v))
  const journalStreak = calcStreak(today, k => (notes[k] || '').trim().length > 10)
  const proteinStreak = calcStreak(today, k => (statsData[k]?.protein || 0) >= 150)
  const totalPages    = Object.values(statsData).reduce((sum, d) => sum + (d?.pages || 0), 0)

  return (
    <div className={styles.wrap}>
      {/* Hero */}
      {isPreSurgery
        ? <PreSurgeryHero today={today} />
        : phase
          ? <PhaseHero phase={phase} today={today} />
          : null
      }

      {/* Quick stats */}
      <div className={styles.chipRow}>
        <StatChip icon="✅" value={`${todayPct}%`}     label="Today Done"     color="#27AE60" />
        <StatChip icon="🔥" value={taskStreak}          label="Task Streak"    color="#E94560" />
        <StatChip icon="📖" value={journalStreak}        label="Journal Streak" color="#3498DB" />
        <StatChip icon="💪" value={proteinStreak}        label="Protein Streak" color="#E67E22" />
        <StatChip icon="📚" value={totalPages}           label="Pages Read"     color="#9B59B6" />
      </div>

      {/* Current phase goals */}
      {phase && (
        <>
          <div className={styles.sectionTitle}>Current Phase Goals — {phase.name}</div>
          <div className={styles.goalsGrid}>
            {Object.entries(phase.goals).map(([cat, items]) => (
              <GoalCard key={cat} cat={cat} items={items} color={phase.color} />
            ))}
          </div>
        </>
      )}

      {/* Pre-surgery: show today's prep goals */}
      {isPreSurgery && PRE_SURGERY[today] && (
        <>
          <div className={styles.sectionTitle}>Today's Prep — {PRE_SURGERY[today].label}</div>
          <div className={styles.goalsGrid}>
            <GoalCard cat="Physical"    items={PRE_SURGERY[today].physical}  color="#E74C3C" />
            <GoalCard cat="Logistics"   items={PRE_SURGERY[today].logistics} color="#F39C12" />
            <GoalCard cat="Mental"      items={PRE_SURGERY[today].mental}    color="#27AE60" />
          </div>
        </>
      )}
    </div>
  )
}
