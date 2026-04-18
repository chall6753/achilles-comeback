import { useState } from 'react'
import M1_TASKS from '../data/month1Tasks'
import { PHASES } from '../data/phases'
import { useLocalStorage, todayKey, daysSince } from '../hooks/useStorage'
import styles from './Today.module.css'

const SURGERY = '2026-04-24'

function getCurrentPhase() {
  const t = todayKey()
  return PHASES.find(p => t >= p.start && t <= p.end) || null
}

function TaskItem({ text, checked, onChange }) {
  return (
    <div className={`${styles.taskItem} ${checked ? styles.done : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <label onClick={onChange}>{text}</label>
    </div>
  )
}

function TaskSection({ icon, title, items, prefix, saved, onToggle }) {
  const done = items.filter((_, i) => saved[prefix + i]).length
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCount}>{done}/{items.length}</span>
      </div>
      {items.map((item, i) => (
        <TaskItem
          key={i}
          text={item}
          checked={!!saved[prefix + i]}
          onChange={() => onToggle(prefix + i)}
        />
      ))}
    </div>
  )
}

export default function Today() {
  const t = todayKey()
  const [tasks, setTasks] = useLocalStorage('tasks', {})
  const [notes, setNotes] = useLocalStorage('notes', {})
  const dayData = M1_TASKS[t]
  const phase   = getCurrentPhase()
  const days    = daysSince(SURGERY)

  const todayTasks = tasks[t] || {}

  function toggle(key) {
    setTasks(prev => ({
      ...prev,
      [t]: { ...(prev[t] || {}), [key]: !prev[t]?.[key] }
    }))
  }

  // Calculate progress
  let allItems = []
  let sections = []

  if (dayData) {
    allItems = [...dayData.physical, ...dayData.study, ...dayData.mental]
    sections = [
      { icon: '🏥', title: 'PT / Physical',         items: dayData.physical, prefix: 'p' },
      { icon: '📚', title: 'Study / Professional',  items: dayData.study,    prefix: 's' },
      { icon: '🧠', title: 'Mental + Personal',     items: dayData.mental,   prefix: 'm' },
    ]
  } else if (phase) {
    const goals = phase.goals
    sections = [
      { icon: '🏥', title: 'PT / Physical',         items: goals.Physical,     prefix: 'p' },
      { icon: '📚', title: 'Study / Professional',  items: goals.Professional, prefix: 's' },
      { icon: '🧠', title: 'Mental + Personal',     items: [...goals.Mental, ...goals.Personal], prefix: 'm' },
    ]
    allItems = sections.flatMap(s => s.items)
  }

  const doneCount = allItems.filter((_, i) => {
    const section = sections.find(s => i < sections.slice(0, sections.indexOf(s) + 1).reduce((a, ss) => a + ss.items.length, 0))
    return false // simplified — count per section below
  }).length

  const totalDone = sections.reduce((acc, s) => acc + s.items.filter((_, i) => todayTasks[s.prefix + i]).length, 0)
  const totalAll  = allItems.length
  const pct       = totalAll > 0 ? Math.round(totalDone / totalAll * 100) : 0

  if (!phase && t < SURGERY) {
    return (
      <div className={styles.preSurgery}>
        <div className={styles.preSurgeryIcon}>🏥</div>
        <div className={styles.preSurgeryTitle}>Surgery is April 24, 2026</div>
        <div className={styles.preSurgerySub}>Your countdown has begun. Come back on surgery day to start tracking.</div>
      </div>
    )
  }

  return (
    <div>
      {/* Day header */}
      <div className={styles.dayHeader}>
        <div>
          <div className={styles.dayName}>
            {dayData ? dayData.label : `Day ${days} — ${phase?.name}`}
          </div>
          <div className={styles.dayBadge}>
            {dayData ? dayData.badge : phase?.obj}
          </div>
        </div>
        <div className={styles.dayProgress}>
          <div className={styles.dayPct}>{pct}%</div>
          <div className={styles.dayPctLabel}>{totalDone}/{totalAll} done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar} style={{ width: pct + '%' }} />
      </div>

      {/* Task sections */}
      <div className={styles.grid}>
        {sections.map(s => (
          <TaskSection
            key={s.prefix}
            icon={s.icon}
            title={s.title}
            items={s.items}
            prefix={s.prefix}
            saved={todayTasks}
            onToggle={toggle}
          />
        ))}
      </div>

      {/* Notes */}
      <div className={styles.notesCard}>
        <div className={styles.notesTitle}>📝 Daily Notes</div>
        <textarea
          className={styles.notesArea}
          placeholder="Notes for today — what went well, what was hard, what you're grateful for..."
          value={notes[t] || ''}
          onChange={e => setNotes(prev => ({ ...prev, [t]: e.target.value }))}
        />
      </div>
    </div>
  )
}
