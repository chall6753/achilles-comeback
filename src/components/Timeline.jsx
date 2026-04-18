import { useState } from 'react'
import { PHASES } from '../data/phases'
import PRE_SURGERY from '../data/preSurgeryTasks'
import { todayKey, usePhaseGoalOverrides, setPhaseGoalOverride } from '../hooks/useDb'
import styles from './Timeline.module.css'

function EditableGoalCategory({ phaseId, cat, items, color }) {
  const [isEditing, setIsEditing] = useState(false)

  function handleChange(idx, val) {
    setPhaseGoalOverride(phaseId, cat, items.map((it, i) => i === idx ? val : it))
  }
  function handleDelete(idx) {
    setPhaseGoalOverride(phaseId, cat, items.filter((_, i) => i !== idx))
  }
  function handleAdd() {
    setPhaseGoalOverride(phaseId, cat, [...items, ''])
  }

  return (
    <div className={styles.expandedCat}>
      <div className={styles.expandedCatHeader}>
        <div className={styles.expandedCatLabel} style={{ color }}>{cat}</div>
        <button
          type="button"
          className={`${styles.tlEditBtn} ${isEditing ? styles.tlEditBtnActive : ''}`}
          onClick={() => setIsEditing(e => !e)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className={styles.tlEditList}>
          {items.map((item, i) => (
            <div key={i} className={styles.tlEditRow}>
              <input
                className={styles.tlEditInput}
                value={item}
                onChange={e => handleChange(i, e.target.value)}
                placeholder="Goal..."
              />
              <button type="button" className={styles.tlDeleteBtn} onClick={() => handleDelete(i)}>✕</button>
            </div>
          ))}
          <button type="button" className={styles.tlAddBtn} onClick={handleAdd}>+ Add goal</button>
        </div>
      ) : (
        items.map((g, i) => <div key={i} className={styles.expandedItem}>• {g}</div>)
      )}
    </div>
  )
}

const SURGERY_DATE = '2026-04-24'
const PRE_DAYS = Object.entries(PRE_SURGERY).sort(([a], [b]) => a.localeCompare(b))
const COLOR = '#F39C12'

const PRE_CATS = [
  { key: 'physical',  icon: '🏥', label: 'Physical' },
  { key: 'logistics', icon: '📦', label: 'Logistics' },
  { key: 'mental',    icon: '🧠', label: 'Mental' },
]

/* ── Pre-surgery section ──────────────────────────────────────────── */
function PreSurgerySection({ today }) {
  const [expanded, setExpanded] = useState(null)

  const total         = PRE_DAYS.length
  const past          = PRE_DAYS.filter(([d]) => d < today).length
  const pct           = Math.round(past / total * 100)
  const sectionStatus = today >= SURGERY_DATE ? 'past' : today < PRE_DAYS[0][0] ? 'future' : 'current'

  return (
    <div className={styles.preSurgeryCard} style={{ borderColor: sectionStatus === 'current' ? COLOR : 'transparent' }}>
      <div className={styles.preSurgeryHeader}>
        <div>
          <div className={styles.preSurgeryTitle}>🏥 Pre-Surgery Prep</div>
          <div className={styles.preSurgeryDates}>Apr 18 – Apr 23 · Surgery Apr 24</div>
        </div>
        <span className={styles.statusBadge} style={sectionStatus === 'current' ? { background: COLOR, color: '#fff' } : {}}>
          {sectionStatus === 'past' ? '✓ Complete' : sectionStatus === 'current' ? '▶ Active' : 'Upcoming'}
        </span>
      </div>

      <div className={styles.bar} style={{ marginBottom: 14 }}>
        <div className={styles.barFill} style={{ width: pct + '%', background: COLOR }} />
      </div>

      <div className={styles.preDayGrid}>
        {PRE_DAYS.map(([date, day]) => {
          const isToday  = date === today
          const isPast   = date < today
          const isFuture = date > today
          const isOpen   = expanded === date

          return (
            <div key={date} className={styles.preDayOuter}>
              <button
                type="button"
                className={[
                  styles.preDayCard,
                  isToday  && styles.preDayCurrent,
                  isPast   && styles.preDayPast,
                  isFuture && styles.preDayFuture,
                  isOpen   && styles.preDayOpen,
                ].filter(Boolean).join(' ')}
                style={isToday || isOpen ? { borderColor: COLOR } : {}}
                onClick={() => setExpanded(isOpen ? null : date)}
              >
                <div className={styles.preDayLabel}>{day.label}</div>
                <div className={styles.preDayBadge}>{day.badge}</div>
                <div className={styles.preDayGoals}>
                  {[...day.physical, ...day.logistics, ...day.mental].slice(0, 2).map((g, i) => (
                    <div key={i} className={styles.preDayGoalItem}>• {g}</div>
                  ))}
                  <div className={styles.preDayMore}>
                    {isOpen ? '▲ less' : `+ ${day.physical.length + day.logistics.length + day.mental.length - 2} more`}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className={styles.preDayExpanded} style={{ borderColor: COLOR + '44' }}>
                  <div className={styles.expandedTitle}>{day.label} — {day.badge}</div>
                  {PRE_CATS.map(cat => (
                    day[cat.key]?.length > 0 && (
                      <div key={cat.key} className={styles.expandedCat}>
                        <div className={styles.expandedCatLabel}>{cat.icon} {cat.label}</div>
                        {day[cat.key].map((item, i) => (
                          <div key={i} className={styles.expandedItem}>• {item}</div>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Phase expanded goals (needs own component for hook call) ─────── */
function PhaseExpandedGoals({ phase }) {
  const overrides = usePhaseGoalOverrides(phase.id)
  return (
    <div className={styles.phaseExpanded} style={{ borderColor: phase.color + '44' }}>
      <div className={styles.expandedTitle} style={{ color: phase.color }}>{phase.name} — Goals</div>
      <div className={styles.phaseExpandedGrid}>
        {Object.entries(phase.goals).map(([cat, defaultItems]) => (
          <EditableGoalCategory
            key={cat}
            phaseId={phase.id}
            cat={cat}
            items={overrides[cat] ?? defaultItems}
            color={phase.color}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Phase helpers ────────────────────────────────────────────────── */
function getPhaseStatus(p) {
  const t = todayKey()
  if (t > p.end)    return 'past'
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

/* ── Main component ───────────────────────────────────────────────── */
export default function Timeline() {
  const [expandedPhase, setExpandedPhase] = useState(null)
  const today   = todayKey()
  const overall = getOverallProgress()

  return (
    <div>
      {/* Pre-surgery prep */}
      <PreSurgerySection today={today} />

      {/* Overall progress */}
      <div className={styles.overallCard}>
        <div className={styles.overallTop}>
          <div>
            <div className={styles.overallTitle}>6-Month Comeback Arc</div>
            <div className={styles.overallSub}>Day {Math.max(0, Math.floor((new Date(today) - new Date(PHASES[0].start)) / 86400000))} of 183</div>
          </div>
          <div className={styles.overallPct}>{overall}%</div>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: overall + '%', background: '#E94560' }} />
        </div>
      </div>

      {/* Phase cards */}
      <div className={styles.phaseGrid}>
        {PHASES.map(p => {
          const status = getPhaseStatus(p)
          const prog   = getPhaseProgress(p)
          const isOpen = expandedPhase === p.id

          return (
            <div key={p.id}>
              <button
                type="button"
                className={`${styles.phaseCard} ${styles[status]}`}
                style={{ borderColor: status === 'current' || isOpen ? p.color : 'transparent', background: p.color + '12' }}
                onClick={() => setExpandedPhase(isOpen ? null : p.id)}
              >
                <div className={styles.phaseShort} style={{ color: p.color }}>{p.short}</div>
                <div className={styles.phaseName}>{p.name}</div>
                <div className={styles.phaseDates}>{fmt(p.start)} – {fmt(p.end)}</div>
                <div className={styles.phaseWin}>"{p.win}"</div>
                <div className={styles.bar} style={{ marginBottom: 10 }}>
                  <div className={styles.barFill} style={{ width: prog + '%', background: p.color }} />
                </div>
                <span
                  className={`${styles.statusBadge} ${styles['badge_' + status]}`}
                  style={status === 'current' ? { background: p.color, color: '#fff' } : {}}
                >
                  {status === 'current' ? '▶ Current' : status === 'past' ? '✓ Complete' : 'Upcoming'}
                </span>
                <div className={styles.phaseHint}>{isOpen ? '▲' : '▼'}</div>
              </button>

              {isOpen && (
                <PhaseExpandedGoals phase={p} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
