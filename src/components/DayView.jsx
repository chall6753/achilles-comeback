import { useState } from 'react'
import {
  useTasksForDate,
  toggleTask,
  useNote,
  setNote,
  useMentalResponsesForDate,
  setMentalResponse,
  useDayTaskOverrides,
  setDayTaskOverride,
  todayKey,
  daysSince,
} from '../hooks/useDb'
import {
  DAILY_TASKS,
  buildSections,
  getPhaseFor,
} from '../data/dailyTasks'
import NoteEditor from './NoteEditor'
import styles from './Today.module.css'

const SURGERY = '2026-04-24'

/**
 * Single section component handling both regular and mental tasks,
 * with an inline edit mode for full task list control.
 */
function EditableSection({ section, date, overrideItems, saved, onToggle, responses, onResponse }) {
  const [isEditing, setIsEditing] = useState(false)
  const items = overrideItems ?? section.items
  const done  = items.filter((_, i) => saved[section.prefix + i]).length

  function handleChange(idx, val) {
    const next = items.map((it, i) => i === idx ? val : it)
    setDayTaskOverride(date, section.prefix, next)
  }

  function handleDelete(idx) {
    setDayTaskOverride(date, section.prefix, items.filter((_, i) => i !== idx))
  }

  function handleAdd() {
    setDayTaskOverride(date, section.prefix, [...items, ''])
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{section.icon}</span>
        <span className={styles.sectionTitle}>{section.title}</span>
        {!isEditing && <span className={styles.sectionCount}>{done}/{items.length}</span>}
        <button
          type="button"
          className={`${styles.editBtn} ${isEditing ? styles.editBtnActive : ''}`}
          onClick={() => setIsEditing(e => !e)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className={styles.editList}>
          {items.map((item, i) => (
            <div key={i} className={styles.editRow}>
              <input
                className={styles.editInput}
                value={item}
                onChange={e => handleChange(i, e.target.value)}
                placeholder="Task description..."
              />
              <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(i)}>✕</button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={handleAdd}>+ Add task</button>
        </div>
      ) : (
        <>
          {items.map((item, i) => {
            const taskId = section.prefix + i
            if (section.isMental) {
              return (
                <div key={i} className={`${styles.mentalItem} ${saved[taskId] ? styles.done : ''}`}>
                  <div className={styles.mentalTop}>
                    <input type="checkbox" checked={!!saved[taskId]} onChange={() => onToggle(taskId)} />
                    <label onClick={() => onToggle(taskId)}>{item}</label>
                  </div>
                  <input
                    className={styles.mentalInput}
                    type="text"
                    placeholder="Your response..."
                    value={responses?.[taskId] || ''}
                    onChange={e => onResponse?.(taskId, e.target.value)}
                  />
                </div>
              )
            }
            return (
              <div key={i} className={`${styles.taskItem} ${saved[taskId] ? styles.done : ''}`}>
                <input type="checkbox" checked={!!saved[taskId]} onChange={() => onToggle(taskId)} />
                <label onClick={() => onToggle(taskId)}>{item}</label>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default function DayView({ date }) {
  const tasksForDay  = useTasksForDate(date)
  const mentalResps  = useMentalResponsesForDate(date)
  const overrides    = useDayTaskOverrides(date)
  const note         = useNote(date)
  const dayData      = DAILY_TASKS[date]
  const phase        = getPhaseFor(date)
  const days         = daysSince(SURGERY)
  const isToday      = date === todayKey()

  const baseSections = buildSections(date)
  // Merge overrides: replace items if an override exists for that prefix
  const sections = baseSections.map(s => ({
    ...s,
    items: overrides[s.prefix] ?? s.items,
  }))

  const totalDone = sections.reduce((acc, s) => acc + s.items.filter((_, i) => tasksForDay[s.prefix + i]).length, 0)
  const totalAll  = sections.reduce((acc, s) => acc + s.items.length, 0)
  const pct       = totalAll > 0 ? Math.round(totalDone / totalAll * 100) : 0

  if (isToday && !dayData && !phase && date < SURGERY) {
    return (
      <div className={styles.preSurgery}>
        <div className={styles.preSurgeryIcon}>🏥</div>
        <div className={styles.preSurgeryTitle}>Surgery is April 24, 2026</div>
        <div className={styles.preSurgerySub}>Your countdown has begun. Come back closer to surgery for daily prep.</div>
      </div>
    )
  }

  if (!dayData && !phase) {
    const friendly = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    })
    return (
      <div className={styles.preSurgery}>
        <div className={styles.preSurgeryIcon}>📅</div>
        <div className={styles.preSurgeryTitle}>{friendly}</div>
        <div className={styles.preSurgerySub}>Nothing scheduled for this day.</div>
      </div>
    )
  }

  const headerLabel = dayData ? dayData.label : phase ? `Day ${days} — ${phase.name}` : ''
  const headerBadge = dayData ? dayData.badge : phase?.obj || ''

  return (
    <div>
      <div className={styles.dayHeader}>
        <div>
          <div className={styles.dayName}>{headerLabel}</div>
          <div className={styles.dayBadge}>{headerBadge}</div>
        </div>
        <div className={styles.dayProgress}>
          <div className={styles.dayPct}>{pct}%</div>
          <div className={styles.dayPctLabel}>{totalDone}/{totalAll} done</div>
        </div>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressBar} style={{ width: pct + '%' }} />
      </div>

      <div className={styles.grid}>
        {sections.map(s => (
          <EditableSection
            key={s.prefix}
            section={s}
            date={date}
            overrideItems={overrides[s.prefix]}
            saved={tasksForDay}
            onToggle={key => toggleTask(date, key)}
            responses={mentalResps}
            onResponse={(taskId, val) => setMentalResponse(date, taskId, val)}
          />
        ))}
      </div>

      <div className={styles.notesCard}>
        <div className={styles.notesTitle}>📝 Daily Notes</div>
        <NoteEditor
          value={note}
          onChange={val => setNote(date, val)}
          placeholder="Notes for this day — what went well, what was hard, what you're grateful for..."
        />
      </div>
    </div>
  )
}
