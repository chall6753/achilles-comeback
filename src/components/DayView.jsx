import {
  useTasksForDate,
  toggleTask,
  useNote,
  setNote,
  useMentalResponsesForDate,
  setMentalResponse,
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

function MentalTaskSection({ icon, title, items, prefix, saved, onToggle, responses, onResponse }) {
  const done = items.filter((_, i) => saved[prefix + i]).length
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCount}>{done}/{items.length}</span>
      </div>
      {items.map((item, i) => {
        const taskId = prefix + i
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
              value={responses[taskId] || ''}
              onChange={e => onResponse(taskId, e.target.value)}
            />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Renders the task list + notes for a single date.
 *
 * Used by the Today tab (date = todayKey()) and by the Calendar tab
 * when a user clicks a day cell.
 */
export default function DayView({ date }) {
  const tasksForDay  = useTasksForDate(date)
  const mentalResps  = useMentalResponsesForDate(date)
  const note = useNote(date)
  const dayData = DAILY_TASKS[date]
  const phase = getPhaseFor(date)
  const days = daysSince(SURGERY)
  const isToday = date === todayKey()

  const sections = buildSections(date)
  const allItems = sections.flatMap(s => s.items)
  const totalDone = sections.reduce(
    (acc, s) => acc + s.items.filter((_, i) => tasksForDay[s.prefix + i]).length,
    0,
  )
  const totalAll = allItems.length
  const pct = totalAll > 0 ? Math.round(totalDone / totalAll * 100) : 0

  // Pre-surgery splash — only on the actual current day, before surgery,
  // when no per-day data and no phase apply.
  if (isToday && !dayData && !phase && date < SURGERY) {
    return (
      <div className={styles.preSurgery}>
        <div className={styles.preSurgeryIcon}>🏥</div>
        <div className={styles.preSurgeryTitle}>Surgery is April 24, 2026</div>
        <div className={styles.preSurgerySub}>Your countdown has begun. Come back closer to surgery for daily prep.</div>
      </div>
    )
  }

  // For non-today dates with no scheduled content, give a quiet empty state
  // rather than the countdown screen.
  if (!dayData && !phase) {
    const friendly = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
    return (
      <div className={styles.preSurgery}>
        <div className={styles.preSurgeryIcon}>📅</div>
        <div className={styles.preSurgeryTitle}>{friendly}</div>
        <div className={styles.preSurgerySub}>Nothing scheduled for this day.</div>
      </div>
    )
  }

  // Header label/badge: prefer explicit day record, fall back to phase text.
  const headerLabel = dayData
    ? dayData.label
    : phase
      ? `Day ${days} — ${phase.name}`
      : ''
  const headerBadge = dayData
    ? dayData.badge
    : phase?.obj || ''

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
        {sections.map(s =>
          s.isMental ? (
            <MentalTaskSection
              key={s.prefix}
              icon={s.icon}
              title={s.title}
              items={s.items}
              prefix={s.prefix}
              saved={tasksForDay}
              onToggle={(key) => toggleTask(date, key)}
              responses={mentalResps}
              onResponse={(taskId, val) => setMentalResponse(date, taskId, val)}
            />
          ) : (
            <TaskSection
              key={s.prefix}
              icon={s.icon}
              title={s.title}
              items={s.items}
              prefix={s.prefix}
              saved={tasksForDay}
              onToggle={(key) => toggleTask(date, key)}
            />
          )
        )}
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
